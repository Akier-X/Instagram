import { filterLowQuality } from "@/lib/screening/quality";
import { evaluateImagesWithGemini } from "@/lib/screening/gemini-evaluator";
import { scoreImages } from "@/lib/screening/scoring";
import { groupSimilarAndPickBest } from "@/lib/screening/similarity";
import { ScreeningInputItem } from "@/lib/screening/types";

export async function runScreening(items: ScreeningInputItem[]) {
  const qualityFiltered = filterLowQuality(items);
  const deduped = groupSimilarAndPickBest(qualityFiltered);
  const geminiScores = await evaluateImagesWithGemini(deduped);
  const scored = scoreImages(deduped, geminiScores).sort((a, b) => b.totalScore - a.totalScore);
  const topItems = scored.slice(0, 50).map((item, index) => {
    const rank = index < 10 ? "best" : index < 30 ? "good" : "chance";
    return {
      ...item,
      rank,
    };
  });

  const bestCount = Math.min(10, topItems.length);
  const goodCount = Math.max(0, Math.min(20, topItems.length - bestCount));
  const chanceCount = Math.max(0, topItems.length - bestCount - goodCount);

  return {
    stats: {
      inputCount: items.length,
      qualityFilteredCount: qualityFiltered.length,
      dedupedCount: deduped.length,
      outputCount: topItems.length,
      scoringMode: geminiScores ? "gemini" : "fallback",
      bestCount,
      goodCount,
      chanceCount,
    },
    items: topItems,
  };
}
