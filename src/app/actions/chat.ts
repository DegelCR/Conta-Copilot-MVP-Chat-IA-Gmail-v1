"use server";

import { answerInvoiceChat, type ChatTurn } from "@/lib/invoices/chat";
import { buildChatContext } from "@/lib/invoices/chat-context";
import { listConfirmedInvoicesForUser } from "@/lib/invoices/queries";
import { createClient } from "@/lib/supabase/server";

export type ChatActionState = {
  error?: string;
  reply?: string;
};

const MAX_QUESTION_LENGTH = 2000;
const MAX_HISTORY_TURNS = 8;

function parseHistory(raw: FormDataEntryValue | null): ChatTurn[] {
  if (typeof raw !== "string" || !raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is ChatTurn =>
          typeof item === "object" &&
          item !== null &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim().length > 0,
      )
      .slice(-MAX_HISTORY_TURNS);
  } catch {
    return [];
  }
}

export async function sendChatMessageAction(
  _prevState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para usar el chat." };
  }

  const message = String(formData.get("message") ?? "").trim();
  if (!message) {
    return { error: "Escribe una pregunta." };
  }

  if (message.length > MAX_QUESTION_LENGTH) {
    return { error: "La pregunta es demasiado larga (máximo 2000 caracteres)." };
  }

  const history = parseHistory(formData.get("history"));
  const invoices = await listConfirmedInvoicesForUser(100);
  const context = buildChatContext(invoices);

  try {
    const reply = await answerInvoiceChat(message, context, history);
    return { reply };
  } catch (error) {
    const text = error instanceof Error ? error.message : "No se pudo obtener respuesta.";
    return { error: text };
  }
}
