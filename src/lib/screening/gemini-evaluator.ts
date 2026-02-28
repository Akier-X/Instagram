import { GoogleGenerativeAI } from "@google/generative-ai";
import { categories } from "@/lib/photo-types";
import { ScreeningInputItem } from "@/lib/screening/types";

export type GeminiImageScore = {
  id: string;
  visualScore: number;
  memoryScore: number;
  snsScore: number;
  category?: string;
};

type GeminiResponse = {
  scores: GeminiImageScore[];
};

function stripCodeFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}

function normalizeCategory(category?: string) {
  if (!category) return undefined;
  const found = categories.find((item) => item === category);
  return found;
}

export async function evaluateImagesWithGemini(items: ScreeningInputItem[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || items.length === 0) {
    return null;
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const payload = items.map((item) => ({
      id: item.id,
      name: item.name,
      shotAt: item.shotAt,
      width: item.width,
      height: item.height,
      hasThumbnail: Boolean(item.thumbnailUrl || item.webViewUrl),
    }));

    const prompt = [
      "あなたはInstagram投稿候補画像の評価アシスタントです。",
      "各画像について以下を0〜10の小数1桁で評価してください。",
      "- visualScore: 視覚的魅力",
      "- memoryScore: 思い出価値",
      "- snsScore: SNS適性",
      `categoryは次のいずれか: ${categories.join(",")}`,
      "出力はJSONのみで、次の形式を厳守してください: {\"scores\":[{\"id\":\"...\",\"visualScore\":0,\"memoryScore\":0,\"snsScore\":0,\"category\":\"日常\"}]}",
      "入力データ:",
      JSON.stringify(payload),
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(stripCodeFence(text)) as GeminiResponse;

    if (!parsed?.scores || !Array.isArray(parsed.scores)) {
      return null;
    }

    const normalized = parsed.scores
      .filter((item) => typeof item.id === "string")
      .map((item) => ({
        id: item.id,
        visualScore: clampScore(Number(item.visualScore)),
        memoryScore: clampScore(Number(item.memoryScore)),
        snsScore: clampScore(Number(item.snsScore)),
        category: normalizeCategory(item.category),
      }));

    if (normalized.length === 0) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}
