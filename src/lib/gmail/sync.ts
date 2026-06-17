import type { SupabaseClient } from "@supabase/supabase-js";
import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";
import {
  isAllowedInvoiceFileName,
  MAX_INVOICE_FILE_BYTES,
} from "@/lib/invoices/constants";
import { ingestInvoiceFile } from "@/lib/invoices/ingest";
import { formatGmailAfterQuery } from "@/lib/gmail/backfill";
import { MAX_MESSAGES_PER_SYNC } from "@/lib/gmail/config";
import {
  getGmailConnectionSecrets,
  updateGmailConnectionTokens,
  updateGmailSyncState,
} from "@/lib/gmail/connection";
import { createGoogleOAuthClient } from "@/lib/gmail/oauth";

export type GmailSyncResult = {
  messagesScanned: number;
  attachmentsFound: number;
  imported: number;
  skipped: number;
  failed: number;
  mode: "backfill" | "incremental";
};

type AttachmentRef = {
  messageId: string;
  attachmentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  subject: string;
  from: string;
  threadId: string | null;
};

function decodeGmailBase64(data: string): Buffer {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string {
  const found = headers?.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase(),
  );
  return found?.value ?? "";
}

function collectAttachments(
  message: gmail_v1.Schema$Message,
): AttachmentRef[] {
  const results: AttachmentRef[] = [];
  const messageId = message.id ?? "";
  const subject = getHeader(message.payload?.headers, "Subject");
  const from = getHeader(message.payload?.headers, "From");
  const threadId = message.threadId ?? null;

  function walk(part: gmail_v1.Schema$MessagePart | undefined, partId: string) {
    if (!part) return;

    const filename = part.filename ?? "";
    const mimeType = part.mimeType ?? "application/octet-stream";
    const size = part.body?.size ?? 0;

    if (part.body?.attachmentId && filename) {
      if (isAllowedInvoiceFileName(filename, mimeType)) {
        results.push({
          messageId,
          attachmentId: part.body.attachmentId,
          fileName: filename,
          mimeType,
          size,
          subject,
          from,
          threadId,
        });
      }
      return;
    }

    if (part.parts) {
      for (const child of part.parts) {
        walk(child, child.partId ?? partId);
      }
    }
  }

  walk(message.payload, "root");
  return results;
}

async function createGmailClient(
  userId: string,
  secrets: Awaited<ReturnType<typeof getGmailConnectionSecrets>>,
) {
  if (!secrets) {
    throw new Error("No hay conexión de Gmail.");
  }

  const oauth2 = createGoogleOAuthClient();
  oauth2.setCredentials({
    refresh_token: secrets.refresh_token,
    access_token: secrets.access_token ?? undefined,
  });

  oauth2.on("tokens", (tokens) => {
    void updateGmailConnectionTokens(userId, {
      accessToken: tokens.access_token ?? null,
      tokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
    });
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}

async function reserveGmailImport(
  supabase: SupabaseClient,
  userId: string,
  messageId: string,
  attachmentId: string,
): Promise<"new" | "exists"> {
  const { error } = await supabase.from("gmail_imports").insert({
    user_id: userId,
    gmail_message_id: messageId,
    gmail_attachment_id: attachmentId,
    status: "pending",
  });

  if (!error) return "new";

  if (error.code === "23505") return "exists";

  throw new Error(error.message);
}

async function finalizeGmailImport(
  supabase: SupabaseClient,
  userId: string,
  messageId: string,
  attachmentId: string,
  update: {
    status: "imported" | "failed";
    invoiceId?: string | null;
    errorMessage?: string | null;
  },
): Promise<void> {
  await supabase
    .from("gmail_imports")
    .update({
      status: update.status,
      invoice_id: update.invoiceId ?? null,
      error_message: update.errorMessage ?? null,
      imported_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("gmail_message_id", messageId)
    .eq("gmail_attachment_id", attachmentId);
}

async function importAttachment(
  supabase: SupabaseClient,
  userId: string,
  gmail: gmail_v1.Gmail,
  attachment: AttachmentRef,
  result: GmailSyncResult,
): Promise<void> {
  result.attachmentsFound += 1;

  if (attachment.size > MAX_INVOICE_FILE_BYTES) {
    result.failed += 1;
    const reserved = await reserveGmailImport(
      supabase,
      userId,
      attachment.messageId,
      attachment.attachmentId,
    );
    if (reserved === "new") {
      await finalizeGmailImport(
        supabase,
        userId,
        attachment.messageId,
        attachment.attachmentId,
        {
          status: "failed",
          errorMessage: "Adjunto mayor a 10 MB.",
        },
      );
    } else {
      result.skipped += 1;
    }
    return;
  }

  const reserved = await reserveGmailImport(
    supabase,
    userId,
    attachment.messageId,
    attachment.attachmentId,
  );

  if (reserved === "exists") {
    result.skipped += 1;
    return;
  }

  try {
    const attRes = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId: attachment.messageId,
      id: attachment.attachmentId,
    });

    if (!attRes.data.data) {
      throw new Error("Adjunto vacío.");
    }

    const buffer = decodeGmailBase64(attRes.data.data);
    if (buffer.length > MAX_INVOICE_FILE_BYTES) {
      throw new Error("Adjunto mayor a 10 MB.");
    }

    const ingest = await ingestInvoiceFile(supabase, {
      userId,
      fileName: attachment.fileName,
      buffer,
      mimeType: attachment.mimeType,
      source: "gmail",
      sourceMeta: {
        message_id: attachment.messageId,
        attachment_id: attachment.attachmentId,
        subject: attachment.subject,
        from: attachment.from,
        thread_id: attachment.threadId,
      },
      runExtraction: false,
    });

    await finalizeGmailImport(
      supabase,
      userId,
      attachment.messageId,
      attachment.attachmentId,
      {
        status: "imported",
        invoiceId: ingest.invoiceId,
      },
    );

    result.imported += 1;
  } catch (error) {
    result.failed += 1;
    const message = error instanceof Error ? error.message : "Error al importar.";
    await finalizeGmailImport(
      supabase,
      userId,
      attachment.messageId,
      attachment.attachmentId,
      {
        status: "failed",
        errorMessage: message.slice(0, 500),
      },
    );
  }
}

async function processMessage(
  supabase: SupabaseClient,
  userId: string,
  gmail: gmail_v1.Gmail,
  messageId: string,
  result: GmailSyncResult,
): Promise<void> {
  const msgRes = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const attachments = collectAttachments(msgRes.data);
  for (const attachment of attachments) {
    await importAttachment(supabase, userId, gmail, attachment, result);
  }
}

async function listMessageIdsForBackfill(
  gmail: gmail_v1.Gmail,
  afterDate: Date,
): Promise<string[]> {
  const q = `has:attachment after:${formatGmailAfterQuery(afterDate)}`;
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const res = await gmail.users.messages.list({
      userId: "me",
      q,
      maxResults: Math.min(50, MAX_MESSAGES_PER_SYNC - ids.length),
      pageToken,
    });

    for (const message of res.data.messages ?? []) {
      if (message.id) ids.push(message.id);
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken && ids.length < MAX_MESSAGES_PER_SYNC);

  return ids;
}

async function listMessageIdsFromHistory(
  gmail: gmail_v1.Gmail,
  startHistoryId: string,
): Promise<{ messageIds: string[]; latestHistoryId: string | null }> {
  const messageIds = new Set<string>();
  let pageToken: string | undefined;
  let latestHistoryId: string | null = startHistoryId;

  do {
    const res = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: ["messageAdded"],
      pageToken,
    });

    if (res.data.historyId) {
      latestHistoryId = res.data.historyId;
    }

    for (const record of res.data.history ?? []) {
      for (const added of record.messagesAdded ?? []) {
        if (added.message?.id) {
          messageIds.add(added.message.id);
        }
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken && messageIds.size < MAX_MESSAGES_PER_SYNC);

  return {
    messageIds: [...messageIds].slice(0, MAX_MESSAGES_PER_SYNC),
    latestHistoryId,
  };
}

export async function syncGmailInbox(
  supabase: SupabaseClient,
  userId: string,
): Promise<GmailSyncResult> {
  const secrets = await getGmailConnectionSecrets(userId);
  if (!secrets) {
    throw new Error("Conecta Gmail antes de sincronizar.");
  }

  const gmail = await createGmailClient(userId, secrets);
  const profile = await gmail.users.getProfile({ userId: "me" });
  const latestHistoryId = profile.data.historyId ?? null;

  const result: GmailSyncResult = {
    messagesScanned: 0,
    attachmentsFound: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    mode: secrets.last_history_id ? "incremental" : "backfill",
  };

  let messageIds: string[] = [];
  let historyIdToStore = latestHistoryId;

  if (secrets.last_history_id) {
    try {
      const history = await listMessageIdsFromHistory(
        gmail,
        secrets.last_history_id,
      );
      messageIds = history.messageIds;
      if (history.latestHistoryId) {
        historyIdToStore = history.latestHistoryId;
      }
    } catch (error) {
      const status =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status;

      if (status === 404) {
        const after = secrets.backfill_from
          ? new Date(secrets.backfill_from)
          : new Date();
        messageIds = await listMessageIdsForBackfill(gmail, after);
        result.mode = "backfill";
      } else {
        throw error;
      }
    }
  } else {
    const after = secrets.backfill_from
      ? new Date(secrets.backfill_from)
      : new Date();
    messageIds = await listMessageIdsForBackfill(gmail, after);
  }

  result.messagesScanned = messageIds.length;

  for (const messageId of messageIds) {
    await processMessage(supabase, userId, gmail, messageId, result);
  }

  if (latestHistoryId) {
    historyIdToStore = latestHistoryId;
  }

  await updateGmailSyncState(userId, {
    lastHistoryId: historyIdToStore,
    lastSyncedAt: new Date().toISOString(),
  });

  return result;
}
