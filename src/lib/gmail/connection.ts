import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptToken, decryptToken } from "@/lib/crypto/token-encryption";
import { getGmailBackfillFrom } from "@/lib/gmail/backfill";
import { createAdminClient } from "@/lib/supabase/admin";

export type GmailConnectionPublic = {
  google_email: string;
  connected_at: string;
  last_synced_at: string | null;
  backfill_from: string | null;
};

type GmailConnectionRow = {
  user_id: string;
  google_email: string;
  refresh_token: string;
  access_token: string | null;
  token_expires_at: string | null;
  connected_at: string;
  last_synced_at: string | null;
  backfill_from: string | null;
  last_history_id: string | null;
};

export type GmailConnectionSecrets = {
  google_email: string;
  refresh_token: string;
  access_token: string | null;
  token_expires_at: string | null;
  backfill_from: string | null;
  last_history_id: string | null;
};

const PUBLIC_COLUMNS =
  "google_email, connected_at, last_synced_at, backfill_from";

export async function getGmailConnectionPublic(
  supabase: SupabaseClient,
  userId: string,
): Promise<GmailConnectionPublic | null> {
  const { data, error } = await supabase
    .from("gmail_connections")
    .select(PUBLIC_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getGmailConnectionPublic:", error.message);
    return null;
  }

  return data as GmailConnectionPublic | null;
}

/** Lee tokens Gmail con service_role (inaccesibles desde el cliente). */
export async function getGmailConnectionSecrets(
  userId: string,
): Promise<GmailConnectionSecrets | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gmail_connections")
    .select(
      "google_email, refresh_token, access_token, token_expires_at, backfill_from, last_history_id",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getGmailConnectionSecrets:", error.message);
    return null;
  }

  const row = data as GmailConnectionRow;

  try {
    return {
      google_email: row.google_email,
      refresh_token: decryptToken(row.refresh_token),
      access_token: row.access_token ? decryptToken(row.access_token) : null,
      token_expires_at: row.token_expires_at,
      backfill_from: row.backfill_from,
      last_history_id: row.last_history_id,
    };
  } catch (decryptError) {
    console.error("getGmailConnectionSecrets decrypt:", decryptError);
    throw new Error(
      "No se pudieron leer los tokens de Gmail. Reconecta tu cuenta.",
    );
  }
}

export async function upsertGmailConnection(params: {
  userId: string;
  googleEmail: string;
  refreshToken: string;
  accessToken?: string | null;
  tokenExpiresAt?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const backfillFrom = getGmailBackfillFrom().toISOString();

  const { error } = await admin.from("gmail_connections").upsert(
    {
      user_id: params.userId,
      google_email: params.googleEmail,
      refresh_token: encryptToken(params.refreshToken),
      access_token: params.accessToken ? encryptToken(params.accessToken) : null,
      token_expires_at: params.tokenExpiresAt ?? null,
      backfill_from: backfillFrom,
      last_history_id: null,
      last_synced_at: null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateGmailConnectionTokens(
  userId: string,
  tokens: {
    accessToken?: string | null;
    tokenExpiresAt?: string | null;
  },
): Promise<void> {
  const admin = createAdminClient();
  const payload: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (tokens.accessToken !== undefined) {
    payload.access_token = tokens.accessToken
      ? encryptToken(tokens.accessToken)
      : null;
  }

  if (tokens.tokenExpiresAt !== undefined) {
    payload.token_expires_at = tokens.tokenExpiresAt;
  }

  const { error } = await admin
    .from("gmail_connections")
    .update(payload)
    .eq("user_id", userId);

  if (error) {
    console.error("updateGmailConnectionTokens:", error.message);
  }
}

export async function updateGmailSyncState(
  userId: string,
  state: {
    lastHistoryId?: string | null;
    lastSyncedAt?: string;
  },
): Promise<void> {
  const admin = createAdminClient();
  const payload: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (state.lastHistoryId !== undefined) {
    payload.last_history_id = state.lastHistoryId;
  }

  if (state.lastSyncedAt) {
    payload.last_synced_at = state.lastSyncedAt;
  }

  const { error } = await admin
    .from("gmail_connections")
    .update(payload)
    .eq("user_id", userId);

  if (error) {
    console.error("updateGmailSyncState:", error.message);
  }
}

export async function deleteGmailConnection(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("gmail_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
