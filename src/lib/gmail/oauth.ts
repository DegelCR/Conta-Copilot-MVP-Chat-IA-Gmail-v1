import { google } from "googleapis";
import {
  GMAIL_READONLY_SCOPE,
  getGoogleRedirectUri,
  requireGoogleOAuthEnv,
} from "@/lib/gmail/config";

export function createGoogleOAuthClient(redirectUri?: string) {
  const { clientId, clientSecret } = requireGoogleOAuthEnv();
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri ?? getGoogleRedirectUri(),
  );
}

export function buildGmailAuthUrl(state: string, redirectUri?: string): string {
  const oauth2 = createGoogleOAuthClient(redirectUri);
  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_READONLY_SCOPE],
    state,
    include_granted_scopes: true,
  });
}
