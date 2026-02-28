import { NextResponse } from "next/server";
import { clearGoogleTokensCookie } from "@/lib/server/google";

export async function POST() {
  await clearGoogleTokensCookie();
  return NextResponse.json({ ok: true });
}
