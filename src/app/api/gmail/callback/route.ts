import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { getGoogleRedirectUri } from "@/lib/gmail/config";
import {
  getGmailConnectionSecrets,
  upsertGmailConnection,
} from "@/lib/gmail/connection";
import { createGoogleOAuthClient } from "@/lib/gmail/oauth";
import { verifyGmailOAuthState } from "@/lib/gmail/oauth-state";

function gmailErrorRedirect(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/dashboard/gmail?error=${encodeURIComponent(message)}`,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  try {
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      return gmailErrorRedirect(
        origin,
        "Conexión cancelada o denegada en Google.",
      );
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (code && state) {
        const returnTo = `/api/gmail/callback?${url.searchParams.toString()}`;
        return NextResponse.redirect(
          `${origin}/login?redirect=${encodeURIComponent(returnTo)}`,
        );
      }
      return gmailErrorRedirect(origin, "Inicia sesión para conectar Gmail.");
    }

    if (!code || !state) {
      return gmailErrorRedirect(origin, "Respuesta de Google incompleta.");
    }

    if (!(await verifyGmailOAuthState(state, user.id))) {
      return gmailErrorRedirect(
        origin,
        "Sesión OAuth inválida. Intenta conectar de nuevo.",
      );
    }

    const redirectUri = getGoogleRedirectUri(origin);
    const oauth2 = createGoogleOAuthClient(redirectUri);
    const { tokens } = await oauth2.getToken(code);

    let refreshToken = tokens.refresh_token ?? undefined;
    if (!refreshToken) {
      const existing = await getGmailConnectionSecrets(supabase, user.id);
      refreshToken = existing?.refresh_token ?? undefined;
    }

    if (!refreshToken) {
      return gmailErrorRedirect(
        origin,
        "Google no devolvió un token de actualización. En tu cuenta Google → Seguridad, revoca el acceso a Conta Copilot y vuelve a conectar.",
      );
    }

    oauth2.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2 });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const googleEmail = profile.data.emailAddress;

    if (!googleEmail) {
      return gmailErrorRedirect(
        origin,
        "No se pudo leer el correo de Gmail.",
      );
    }

    await upsertGmailConnection({
      supabase,
      userId: user.id,
      googleEmail,
      refreshToken,
      accessToken: tokens.access_token ?? null,
      tokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
    });

    // No sincronizar aquí: cada adjunto con IA puede tardar minutos y el navegador
    // queda en esta URL sin respuesta. La primera sync corre en /dashboard/gmail.
    return NextResponse.redirect(
      `${origin}/dashboard/gmail?connected=1&auto_sync=1`,
    );
  } catch (error) {
    console.error("Gmail OAuth callback:", error);
    const message =
      error instanceof Error ? error.message : "Error al conectar Gmail.";
    return gmailErrorRedirect(origin, message);
  }
}
