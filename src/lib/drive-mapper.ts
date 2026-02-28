import { Category, categories, PhotoItem } from "@/lib/photo-types";

type DriveImageItem = {
  id: string;
  name?: string | null;
  shotAt: string | null;
  thumbnailUrl: string | null;
  webViewUrl: string | null;
  width?: number | null;
  height?: number | null;
};

type ScreenedDriveItem = DriveImageItem & {
  totalScore: number;
  category: Category;
  rank: PhotoItem["rank"];
};

const fallbackGradients = [
  "bg-gradient-to-br from-blue-200 to-cyan-300",
  "bg-gradient-to-br from-orange-200 to-amber-300",
  "bg-gradient-to-br from-indigo-200 to-violet-300",
  "bg-gradient-to-br from-pink-200 to-rose-300",
  "bg-gradient-to-br from-teal-200 to-emerald-300",
  "bg-gradient-to-br from-sky-200 to-blue-300",
];

function resolveRank(score: number): PhotoItem["rank"] {
  if (score >= 24) return "best";
  if (score >= 20) return "good";
  return "chance";
}

export function mapDriveImagesToPhotoItems(items: DriveImageItem[]): PhotoItem[] {
  return items.map((item, index) => {
    const score = Math.max(17, 29 - (index % 13));
    const date = item.shotAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    const category: Category = categories[index % categories.length];
    const url = item.thumbnailUrl || item.webViewUrl;

    return {
      id: item.id,
      score,
      date,
      category,
      rank: resolveRank(score),
      preview: url
        ? { kind: "url", value: url }
        : { kind: "gradient", value: fallbackGradients[index % fallbackGradients.length] },
    };
  });
}

export function mapScreenedDriveItemsToPhotoItems(items: ScreenedDriveItem[]): PhotoItem[] {
  return items.map((item, index) => {
    const score = Math.round(item.totalScore);
    const date = item.shotAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    const url = item.thumbnailUrl || item.webViewUrl;

    return {
      id: item.id,
      score,
      date,
      category: item.category,
      rank: item.rank,
      preview: url
        ? { kind: "url", value: url }
        : { kind: "gradient", value: fallbackGradients[index % fallbackGradients.length] },
    };
  });
}
