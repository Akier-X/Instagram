import { Category } from "@/lib/photo-types";

export type ScreeningInputItem = {
  id: string;
  name: string | null;
  shotAt: string | null;
  thumbnailUrl: string | null;
  webViewUrl: string | null;
  width: number | null;
  height: number | null;
};

export type ScreenedItem = ScreeningInputItem & {
  visualScore: number;
  memoryScore: number;
  snsScore: number;
  totalScore: number;
  category: Category;
  rank: "best" | "good" | "chance";
};
