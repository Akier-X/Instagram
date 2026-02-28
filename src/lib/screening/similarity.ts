import { ScreeningInputItem } from "@/lib/screening/types";

function normalizeName(name: string | null) {
  if (!name) return "unknown";
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[\s_-]*\d+$/g, "")
    .trim();
}

function dayString(shotAt: string | null) {
  if (!shotAt) return "unknown-day";
  return shotAt.slice(0, 10);
}

function pixelCount(item: ScreeningInputItem) {
  return (item.width ?? 0) * (item.height ?? 0);
}

export function groupSimilarAndPickBest(items: ScreeningInputItem[]) {
  const groups = new Map<string, ScreeningInputItem[]>();

  for (const item of items) {
    const key = `${normalizeName(item.name)}::${dayString(item.shotAt)}`;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  const representatives: ScreeningInputItem[] = [];
  for (const list of groups.values()) {
    const sorted = [...list].sort((a, b) => {
      const pixelDiff = pixelCount(b) - pixelCount(a);
      if (pixelDiff !== 0) return pixelDiff;
      return (b.shotAt ?? "").localeCompare(a.shotAt ?? "");
    });
    representatives.push(sorted[0]);
  }

  return representatives;
}
