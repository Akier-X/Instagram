"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@/components/AppButton";
import { findPhotosByIds, themes, type PostTheme } from "@/lib/mock-data";
import { getSelectedPhotosStorage, setSelectedPhotosStorage } from "@/lib/selection-storage";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const selectedPhotos = (() => {
    const fromStorage = getSelectedPhotosStorage();
    if (fromStorage.length > 0) {
      return ids.length > 0 ? fromStorage.filter((photo) => ids.includes(photo.id)) : fromStorage;
    }
    return findPhotosByIds(ids);
  })();

  const [memo, setMemo] = useState("");
  const [theme, setTheme] = useState<PostTheme>("日常");

  const goResult = () => {
    setSelectedPhotosStorage(selectedPhotos);
    const params = new URLSearchParams({
      ids: ids.join(","),
      memo,
      theme,
    });
    router.push(`/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Editor</h1>
          <AppButton variant="secondary" onClick={() => router.push("/")}>写真一覧へ戻る</AppButton>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">選択画像</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {selectedPhotos.map((photo) => (
              <div key={photo.id} className="relative h-24 min-w-24 overflow-hidden rounded-xl border border-slate-200" title={photo.date}>
                {photo.preview.kind === "url" ? (
                  <img src={photo.preview.value} alt="selected" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`h-full w-full ${photo.preview.value}`} />
                )}
              </div>
            ))}
            {selectedPhotos.length === 0 && (
              <p className="text-sm text-slate-500">画像が選択されていません。Home画面から1〜3枚選択してください。</p>
            )}
          </div>
        </section>

        <section className="mb-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="memo">
              一言メモ
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="この時どんな気持ちだった？"
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 outline-none ring-blue-200 transition focus:ring"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">テーマ選択</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((item) => {
                const active = item === theme;
                return (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-blue-500 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                    onClick={() => setTheme(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <AppButton className="w-full py-3 text-base" onClick={goResult} disabled={selectedPhotos.length === 0}>
          生成する
        </AppButton>
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <EditorContent />
    </Suspense>
  );
}
