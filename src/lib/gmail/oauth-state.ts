import crypto from "crypto";
import { cookies } from "next/headers";
import { GMAIL_OAUTH_STATE_COOKIE } from "@/lib/gmail/config";

export async function setGmailOAuthState(userId: string): Promise<string> {
  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(GMAIL_OAUTH_STATE_COOKIE, `${state}:${userId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return state;
}

export async function verifyGmailOAuthState(
  state: string,
  userId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(GMAIL_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GMAIL_OAUTH_STATE_COOKIE);

  if (!raw) return false;

  const [cookieState, cookieUserId] = raw.split(":");
  return cookieState === state && cookieUserId === userId;
}
