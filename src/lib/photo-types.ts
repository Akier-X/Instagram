export const categories = ["日常", "旅行", "学び", "友人", "イベント"] as const;

export type Category = (typeof categories)[number];
export type RankTab = "all" | "best" | "good" | "chance";

export type PhotoPreview =
  | {
      kind: "gradient";
      value: string;
    }
  | {
      kind: "url";
      value: string;
    };

export type PhotoItem = {
  id: string;
  score: number;
  date: string;
  category: Category;
  rank: Exclude<RankTab, "all">;
  preview: PhotoPreview;
};

export const rankTabs: { key: RankTab; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "best", label: "⭐ ベスト" },
  { key: "good", label: "📸 良い感じ" },
  { key: "chance", label: "💡 ワンチャン" },
];
