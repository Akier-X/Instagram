import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/server/google";

export async function GET() {
  try {
    const url = buildGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
