import { NextRequest, NextResponse } from "next/server";
import { generatePost } from "@/lib/post-generator";
import { type PostTheme } from "@/lib/mock-data";
import { PhotoItem } from "@/lib/photo-types";
import { generatePostWithGemini } from "@/lib/server/gemini-post";

type Body = {
  selectedPhotos?: PhotoItem[];
  memo?: string;
  theme?: PostTheme;
  variant?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const selectedPhotos = Array.isArray(body.selectedPhotos) ? body.selectedPhotos : [];
    const memo = typeof body.memo === "string" ? body.memo : "";
    const theme = body.theme ?? "日常";
    const variant = Number(body.variant ?? 0);

    const gemini = await generatePostWithGemini({
      selectedPhotos,
      memo,
      theme,
      variant,
    });

    if (gemini) {
      return NextResponse.json({ ...gemini, mode: "gemini" as const });
    }

    const fallback = generatePost({ selectedPhotos, memo, theme, variant });
    return NextResponse.json({ ...fallback, mode: "fallback" as const });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
