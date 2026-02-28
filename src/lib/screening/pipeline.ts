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
  const topItems = scored.slice(0, 50);

  return {
    stats: {
      inputCount: items.length,
      qualityFilteredCount: qualityFiltered.length,
      dedupedCount: deduped.length,
      outputCount: topItems.length,
      scoringMode: geminiScores ? "gemini" : "fallback",
    },
    items: topItems,
  };
}
