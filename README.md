# insta-app

AI Instagram投稿生成ツールのMVP実装です。  
現在はUIフロー（Home / Editor / Result）とGoogle Drive OAuth接続の初期実装まで完了しています。

## 起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Google Drive OAuth設定

1. `.env.example` をコピーして `.env.local` を作成
2. Google Cloud ConsoleでOAuthクライアントを作成
3. リダイレクトURIに `http://localhost:3000/api/auth/callback` を登録
4. `.env.local` に以下を設定

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GEMINI_API_KEY=...
```

## 実装済み（初期）

- Home: 写真グリッド、おすすめタブ、カテゴリ/並び替え、最大3枚選択、固定フッターCTA
	- カテゴリ + 日付フィルター対応
- Editor: 選択画像表示、一言メモ、テーマ選択（日常/学び/挑戦）、生成ボタン
- Result: 投稿本文、ハッシュタグ、全文コピー、再生成、サブ情報表示
	- 生成API（`/api/generate`）を呼び出し、Gemini優先で本文/タグ生成
- Google OAuth: 接続/解除、接続状態確認API
- Drive API: 画像一覧取得API（`/api/drive/images`）
- 自動スクリーニング: 低品質除外 → 類似統合 → 3軸スコアリング → 上位50枚抽出（`/api/screening`）
	- おすすめ枠をベスト10 / 良い感じ20 / ワンチャン20で固定
	- `GEMINI_API_KEY` 設定時はGemini評価
	- 未設定または失敗時はルールベース評価に自動フォールバック
- 投稿生成:
	- `GEMINI_API_KEY` 設定時はGeminiで本文/タグ生成
	- 未設定または失敗時はテンプレート生成に自動フォールバック

## 主要ファイル

- `src/app/page.tsx` (Home)
- `src/app/editor/page.tsx` (Editor)
- `src/app/result/page.tsx` (Result)
- `src/components/PhotoCard.tsx`
- `src/components/AppButton.tsx`
- `src/lib/mock-data.ts`
- `src/lib/post-generator.ts`
- `src/lib/server/google.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/auth/status/route.ts`
- `src/app/api/auth/disconnect/route.ts`
- `src/app/api/drive/images/route.ts`
- `src/app/api/screening/route.ts`
- `src/app/api/generate/route.ts`
- `src/lib/screening/pipeline.ts`
- `src/lib/screening/quality.ts`
- `src/lib/screening/similarity.ts`
- `src/lib/screening/scoring.ts`
- `src/lib/screening/gemini-evaluator.ts`
- `src/lib/server/gemini-post.ts`

## 次の実装候補

- Gemini API連携（本文/タグ生成を実データ化）
- 画面上でスクリーニング根拠（3軸内訳）を表示

## 補足

- 認証なしでもモックデータで全画面フロー（Home / Editor / Result）は動作します。
