import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, setGoogleTokensCookie } from "@/lib/server/google";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?authError=missing_code", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await setGoogleTokensCookie(tokens);
    return NextResponse.redirect(new URL("/?connected=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/?authError=token_exchange_failed", request.url));
  }
}
