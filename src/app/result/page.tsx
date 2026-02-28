"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@/components/AppButton";
import { findPhotosByIds, type PostTheme } from "@/lib/mock-data";
import { getSelectedPhotosStorage } from "@/lib/selection-storage";

type GeneratedResponse = {
  body: string;
  hashtags: string[];
  mode: "gemini" | "fallback";
};

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const memo = searchParams.get("memo") ?? "";
  const theme = (searchParams.get("theme") as PostTheme | null) ?? "日常";

  const selectedPhotos = (() => {
    const fromStorage = getSelectedPhotosStorage();
    if (fromStorage.length > 0) {
      return ids.length > 0 ? fromStorage.filter((photo) => ids.includes(photo.id)) : fromStorage;
    }
    return findPhotosByIds(ids);
  })();
  const [variant, setVariant] = useState(0);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState<GeneratedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      setLoading(true);
      setError(null);

      const currentSelectedPhotos = (() => {
        const fromStorage = getSelectedPhotosStorage();
        if (fromStorage.length > 0) {
          return ids.length > 0 ? fromStorage.filter((photo) => ids.includes(photo.id)) : fromStorage;
        }
        return findPhotosByIds(ids);
      })();

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedPhotos: currentSelectedPhotos,
            memo,
            theme,
            variant,
          }),
        });

        if (!response.ok) {
          throw new Error("投稿生成に失敗しました");
        }

        const data = (await response.json()) as GeneratedResponse;
        if (!cancelled) {
          setGenerated(data);
        }
      } catch (generationError) {
        if (!cancelled) {
          setError(generationError instanceof Error ? generationError.message : "投稿生成に失敗しました");
          setGenerated(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [ids, memo, theme, variant]);

  const fullText = useMemo(() => {
    if (!generated) {
      return "";
    }
    return `${generated.body}\n\n${generated.hashtags.join(" ")}`;
  }, [generated]);

  const copyAll = async () => {
    if (!fullText) {
      return;
    }
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Result</h1>
          <AppButton variant="secondary" onClick={() => router.back()}>
            編集へ戻る
          </AppButton>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-slate-700">投稿本文</p>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 whitespace-pre-wrap text-slate-800">
            {loading && "生成中..."}
            {!loading && error && error}
            {!loading && !error && generated?.body}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-slate-700">ハッシュタグ</p>
          <div className="flex flex-wrap gap-2">
            {(generated?.hashtags ?? []).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-slate-700">サブ情報</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-700">
              日付: {selectedPhotos[0]?.date ?? "-"}
            </span>
            {selectedPhotos.map((photo) => (
              <div key={photo.id} className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200">
                {photo.preview.kind === "url" ? (
                  <img src={photo.preview.value} alt="thumb" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`h-full w-full ${photo.preview.value}`} />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <AppButton className="px-6 py-3 text-base" onClick={copyAll} disabled={!generated || Boolean(error) || loading}>
            全文コピー
          </AppButton>
          <AppButton variant="secondary" className="px-6 py-3 text-base" onClick={() => setVariant((prev) => prev + 1)}>
            再生成
          </AppButton>
          {generated && <span className="text-xs text-slate-500">生成モード: {generated.mode}</span>}
          {copied && <span className="text-sm font-medium text-blue-600">コピーしました</span>}
        </div>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResultContent />
    </Suspense>
  );
}
