import { NextRequest, NextResponse } from "next/server";
import { runScreening } from "@/lib/screening/pipeline";
import { ScreeningInputItem } from "@/lib/screening/types";

type Body = {
  items?: ScreeningInputItem[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const items = body.items ?? [];
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }

    const screened = await runScreening(items);
    return NextResponse.json(screened);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
