export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export const GMAIL_OAUTH_STATE_COOKIE = "gmail_oauth_state";

export const MAX_MESSAGES_PER_SYNC = 50;

export function getGoogleRedirectUri(origin?: string): string {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) return configured;

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    origin ||
    "http://localhost:3000";

  return `${base.replace(/\/$/, "")}/api/gmail/callback`;
}

export function requireGoogleOAuthEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env.local.",
    );
  }

  return { clientId, clientSecret };
}
