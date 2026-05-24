import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireGmailTokenEncryptionKey } from "@/lib/crypto/token-encryption";
import { getGoogleRedirectUri } from "@/lib/gmail/config";
import { buildGmailAuthUrl } from "@/lib/gmail/oauth";
import { setGmailOAuthState } from "@/lib/gmail/oauth-state";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = new URL(request.url).origin;
  const gmailPage = `${origin}/dashboard/gmail`;

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?redirect=${encodeURIComponent("/dashboard/gmail")}`,
    );
  }

  try {
    requireGmailTokenEncryptionKey();
    const state = await setGmailOAuthState(user.id);
    const redirectUri = getGoogleRedirectUri(origin);
    const authUrl = buildGmailAuthUrl(state, redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo iniciar la conexión.";
    return NextResponse.redirect(
      `${gmailPage}?error=${encodeURIComponent(message)}`,
    );
  }
}
