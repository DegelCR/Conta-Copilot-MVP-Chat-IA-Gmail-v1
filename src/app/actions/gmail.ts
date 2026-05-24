"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteGmailConnection } from "@/lib/gmail/connection";
import { syncGmailInbox, type GmailSyncResult } from "@/lib/gmail/sync";

export type GmailActionState = {
  error?: string;
  message?: string;
  sync?: GmailSyncResult;
};

function revalidateGmailPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/gmail");
  revalidatePath("/dashboard/invoices");
}

export async function syncGmailAction(
  _prevState: GmailActionState,
): Promise<GmailActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  try {
    const sync = await syncGmailInbox(supabase, user.id);
    revalidateGmailPaths();

    const parts = [
      `${sync.imported} importada${sync.imported === 1 ? "" : "s"}`,
      sync.skipped > 0 ? `${sync.skipped} omitida${sync.skipped === 1 ? "" : "s"}` : null,
      sync.failed > 0 ? `${sync.failed} con error` : null,
    ].filter(Boolean);

    return {
      message: `Sincronización (${sync.mode}): ${parts.join(", ")}.`,
      sync,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error al sincronizar.";
    return { error: detail };
  }
}

export async function disconnectGmailAction(
  _prevState: GmailActionState,
): Promise<GmailActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  try {
    await deleteGmailConnection(supabase, user.id);
    revalidateGmailPaths();
    return { message: "Gmail desconectado correctamente." };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error al desconectar.";
    return { error: detail };
  }
}
