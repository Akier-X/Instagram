import { GoogleGenerativeAI } from "@google/generative-ai";
import { type PostTheme } from "@/lib/mock-data";
import { PhotoItem } from "@/lib/photo-types";

type GeminiPostInput = {
  selectedPhotos: PhotoItem[];
  memo: string;
  theme: PostTheme;
  variant: number;
};

type GeminiPostOutput = {
  body: string;
  hashtags: string[];
};

function stripCodeFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function normalizeHashtags(input: unknown) {
  if (!Array.isArray(input)) return [];
  const tags = input
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .map((tag) => tag.replace(/\s+/g, ""))
    .filter((tag) => tag.length > 1);

  const unique = [...new Set(tags)];
  return unique.slice(0, 15);
}

export async function generatePostWithGemini({ selectedPhotos, memo, theme, variant }: GeminiPostInput): Promise<GeminiPostOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const leadDates = selectedPhotos.map((photo) => photo.date).filter(Boolean).slice(0, 3);

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = [
      "あなたはInstagram投稿文の作成アシスタントです。",
      "以下の要件を厳守して日本語で作成してください。",
      "- 日付を自然に含める",
      "- 過去の状況・感情",
      "- 現在との接続",
      "- 学び・気づき",
      "- 将来への軽い言及",
      "- トーンは自己ブランディング向けで自然",
      "- ハッシュタグは10〜15個",
      "- 出力はJSONのみ: {\"body\":\"...\",\"hashtags\":[\"#...\"]}",
      `テーマ: ${theme}`,
      `再生成バリエーション番号: ${variant}`,
      `日付候補: ${leadDates.join(",") || "なし"}`,
      `ユーザーメモ: ${memo || "（入力なし）"}`,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(stripCodeFence(text)) as { body?: unknown; hashtags?: unknown };

    if (typeof parsed.body !== "string") {
      return null;
    }

    const hashtags = normalizeHashtags(parsed.hashtags);
    if (hashtags.length < 10) {
      return null;
    }

    return {
      body: parsed.body.trim(),
      hashtags,
    };
  } catch {
    return null;
  }
}
