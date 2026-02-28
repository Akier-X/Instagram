import { NextResponse } from "next/server";
import { getGoogleTokensFromCookie } from "@/lib/server/google";

export async function GET() {
  const tokens = await getGoogleTokensFromCookie();
  const connected = Boolean(tokens?.access_token || tokens?.refresh_token);
  return NextResponse.json({ connected });
}
