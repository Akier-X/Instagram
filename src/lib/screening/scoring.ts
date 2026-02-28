import { categories, Category } from "@/lib/photo-types";
import { GeminiImageScore } from "@/lib/screening/gemini-evaluator";
import { ScreenedItem, ScreeningInputItem } from "@/lib/screening/types";

function hashToUnit(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

function normalizePixelScore(width: number | null, height: number | null) {
  const pixels = (width ?? 0) * (height ?? 0);
  if (pixels <= 0) return 5;
  if (pixels >= 4000 * 3000) return 10;
  if (pixels >= 1920 * 1080) return 8;
  if (pixels >= 1280 * 720) return 7;
  return 5;
}

function toOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function resolveCategory(item: ScreeningInputItem): Category {
  const seed = `${item.id}:${item.name ?? ""}`;
  const index = Math.floor(hashToUnit(seed) * categories.length) % categories.length;
  return categories[index];
}

function resolveRank(total: number): ScreenedItem["rank"] {
  if (total >= 24) return "best";
  if (total >= 20) return "good";
  return "chance";
}

function scoreFallback(item: ScreeningInputItem) {
  const baseSeed = `${item.id}:${item.shotAt ?? ""}:${item.name ?? ""}`;
  const visual = Math.min(10, normalizePixelScore(item.width, item.height) + hashToUnit(`${baseSeed}:v`) * 1.2);
  const memory = 6 + hashToUnit(`${baseSeed}:m`) * 4;
  const sns = 5.5 + hashToUnit(`${baseSeed}:s`) * 4.5;

  return {
    visualScore: toOneDecimal(visual),
    memoryScore: toOneDecimal(memory),
    snsScore: toOneDecimal(sns),
    category: resolveCategory(item),
  };
}

export function scoreImages(items: ScreeningInputItem[], geminiScores?: GeminiImageScore[] | null): ScreenedItem[] {
  const scoreMap = new Map((geminiScores ?? []).map((item) => [item.id, item]));

  return items.map((item) => {
    const fromGemini = scoreMap.get(item.id);
    const fallback = scoreFallback(item);

    const visualScore = toOneDecimal(fromGemini?.visualScore ?? fallback.visualScore);
    const memoryScore = toOneDecimal(fromGemini?.memoryScore ?? fallback.memoryScore);
    const snsScore = toOneDecimal(fromGemini?.snsScore ?? fallback.snsScore);
    const totalScore = toOneDecimal(visualScore + memoryScore + snsScore);

    return {
      ...item,
      visualScore,
      memoryScore,
      snsScore,
      totalScore,
      category: (fromGemini?.category as Category | undefined) ?? fallback.category,
      rank: resolveRank(totalScore),
    };
  });
}
