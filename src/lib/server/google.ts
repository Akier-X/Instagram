import { cookies } from "next/headers";
import { google } from "googleapis";

export const GOOGLE_TOKENS_COOKIE = "google_tokens";

type GoogleEnvKey = "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "GOOGLE_REDIRECT_URI";

function getEnv(key: GoogleEnvKey) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
}

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    getEnv("GOOGLE_CLIENT_ID"),
    getEnv("GOOGLE_CLIENT_SECRET"),
    getEnv("GOOGLE_REDIRECT_URI"),
  );
}

export type StoredGoogleTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
};

function encodeTokens(tokens: StoredGoogleTokens) {
  return Buffer.from(JSON.stringify(tokens), "utf-8").toString("base64url");
}

function decodeTokens(raw: string): StoredGoogleTokens {
  return JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
}

export async function setGoogleTokensCookie(tokens: StoredGoogleTokens) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: GOOGLE_TOKENS_COOKIE,
    value: encodeTokens(tokens),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGoogleTokensCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(GOOGLE_TOKENS_COOKIE);
}

export async function getGoogleTokensFromCookie(): Promise<StoredGoogleTokens | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(GOOGLE_TOKENS_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return decodeTokens(raw);
  } catch {
    return null;
  }
}

export async function getAuthorizedDriveClient() {
  const oauthClient = getGoogleOAuthClient();
  const tokens = await getGoogleTokensFromCookie();

  if (!tokens?.access_token) {
    throw new Error("Not authenticated with Google");
  }

  oauthClient.setCredentials({
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
  });
  return google.drive({ version: "v3", auth: oauthClient });
}

export function buildGoogleAuthUrl() {
  const oauthClient = getGoogleOAuthClient();
  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauthClient = getGoogleOAuthClient();
  const { tokens } = await oauthClient.getToken(code);
  return tokens;
}
