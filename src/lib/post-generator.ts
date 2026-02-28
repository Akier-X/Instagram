import { type PostTheme } from "@/lib/mock-data";
import { PhotoItem } from "@/lib/photo-types";

type GeneratePostInput = {
  selectedPhotos: PhotoItem[];
  memo: string;
  theme: PostTheme;
  variant?: number;
};

export function generatePost({ selectedPhotos, memo, theme, variant = 0 }: GeneratePostInput) {
  const leadPhoto = selectedPhotos[0];
  const dateText = leadPhoto?.date ?? "2025-01-01";
  const memoryLine = memo.trim().length > 0 ? memo.trim() : "当時は目の前のことに集中していて、全体像はまだ見えていなかった";

  const bridges = [
    "あのときの感情を、今の選択にちゃんとつなげていきたい。",
    "今振り返ると、小さな経験が今の行動の軸になっている。",
    "当時は気づけなかった意味が、今ならはっきり見える。",
  ];

  const futureLines = {
    日常: "これからも日々の積み重ねを言葉と行動で残していく。",
    学び: "この学びを次の挑戦に変えて、実践で価値にしていく。",
    挑戦: "次はもう一段高い目標に挑み、結果で示していく。",
  } as const;

  const body = [
    `${dateText}の1枚。`,
    memoryLine,
    bridges[variant % bridges.length],
    `テーマは「${theme}」。この経験から得た気づきを、今の自分の軸として活かしていく。`,
    futureLines[theme],
  ].join("\n\n");

  const hashtags = [
    "#振り返り",
    "#自己成長",
    "#記録",
    "#過去と現在",
    "#学び",
    "#挑戦",
    "#自己ブランディング",
    "#日々の積み重ね",
    "#マインドセット",
    "#instadaily",
    "#archive",
  ];

  return {
    body,
    hashtags: hashtags.slice(0, 11 + (variant % 4)),
  };
}
