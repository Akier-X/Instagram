import { categories, PhotoItem, rankTabs } from "@/lib/photo-types";

export const photos: PhotoItem[] = [
  { id: "p01", score: 28, date: "2024-10-08", category: "旅行", rank: "best", preview: { kind: "gradient", value: "bg-gradient-to-br from-blue-200 to-cyan-300" } },
  { id: "p02", score: 26, date: "2024-11-11", category: "友人", rank: "best", preview: { kind: "gradient", value: "bg-gradient-to-br from-orange-200 to-amber-300" } },
  { id: "p03", score: 25, date: "2025-01-22", category: "学び", rank: "best", preview: { kind: "gradient", value: "bg-gradient-to-br from-indigo-200 to-violet-300" } },
  { id: "p04", score: 24, date: "2025-02-10", category: "イベント", rank: "best", preview: { kind: "gradient", value: "bg-gradient-to-br from-pink-200 to-rose-300" } },
  { id: "p05", score: 24, date: "2025-03-03", category: "日常", rank: "best", preview: { kind: "gradient", value: "bg-gradient-to-br from-teal-200 to-emerald-300" } },
  { id: "p06", score: 23, date: "2024-08-18", category: "旅行", rank: "good", preview: { kind: "gradient", value: "bg-gradient-to-br from-sky-200 to-blue-300" } },
  { id: "p07", score: 22, date: "2024-09-02", category: "日常", rank: "good", preview: { kind: "gradient", value: "bg-gradient-to-br from-lime-200 to-green-300" } },
  { id: "p08", score: 22, date: "2025-01-06", category: "学び", rank: "good", preview: { kind: "gradient", value: "bg-gradient-to-br from-purple-200 to-fuchsia-300" } },
  { id: "p09", score: 21, date: "2025-02-14", category: "友人", rank: "good", preview: { kind: "gradient", value: "bg-gradient-to-br from-red-200 to-orange-300" } },
  { id: "p10", score: 21, date: "2025-02-22", category: "イベント", rank: "good", preview: { kind: "gradient", value: "bg-gradient-to-br from-violet-200 to-indigo-300" } },
  { id: "p11", score: 20, date: "2024-06-30", category: "日常", rank: "chance", preview: { kind: "gradient", value: "bg-gradient-to-br from-zinc-200 to-slate-300" } },
  { id: "p12", score: 19, date: "2024-07-13", category: "旅行", rank: "chance", preview: { kind: "gradient", value: "bg-gradient-to-br from-emerald-200 to-teal-300" } },
  { id: "p13", score: 19, date: "2024-12-09", category: "学び", rank: "chance", preview: { kind: "gradient", value: "bg-gradient-to-br from-cyan-200 to-sky-300" } },
  { id: "p14", score: 18, date: "2025-01-17", category: "イベント", rank: "chance", preview: { kind: "gradient", value: "bg-gradient-to-br from-rose-200 to-pink-300" } },
  { id: "p15", score: 17, date: "2025-02-27", category: "友人", rank: "chance", preview: { kind: "gradient", value: "bg-gradient-to-br from-amber-200 to-yellow-300" } },
];

export const themes = ["日常", "学び", "挑戦"] as const;
export type PostTheme = (typeof themes)[number];

export { categories, rankTabs };

export function findPhotosByIds(ids: string[]) {
  return photos.filter((photo) => ids.includes(photo.id));
}
