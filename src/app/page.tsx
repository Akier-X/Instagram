"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/AppButton";
import { PhotoCard } from "@/components/PhotoCard";
import { mapScreenedDriveItemsToPhotoItems } from "@/lib/drive-mapper";
import { photos } from "@/lib/mock-data";
import { categories, PhotoItem, rankTabs, type Category, type RankTab } from "@/lib/photo-types";
import { setSelectedPhotosStorage } from "@/lib/selection-storage";

type DriveImagesResponse = {
  items: {
    id: string;
    name: string | null;
    shotAt: string | null;
    width: number | null;
    height: number | null;
    thumbnailUrl: string | null;
    webViewUrl: string | null;
  }[];
};

type ScreeningResponse = {
  stats: {
    inputCount: number;
    qualityFilteredCount: number;
    dedupedCount: number;
    outputCount: number;
    scoringMode: "gemini" | "fallback";
    bestCount: number;
    goodCount: number;
    chanceCount: number;
  };
  items: {
    id: string;
    name: string | null;
    shotAt: string | null;
    width: number | null;
    height: number | null;
    thumbnailUrl: string | null;
    webViewUrl: string | null;
    totalScore: number;
    category: Category;
    rank: PhotoItem["rank"];
  }[];
};

export default function Home() {
  const router = useRouter();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [drivePhotos, setDrivePhotos] = useState<PhotoItem[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [screeningSummary, setScreeningSummary] = useState<string>("");
  const [activeTab, setActiveTab] = useState<RankTab>("best");
  const [category, setCategory] = useState<Category | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", { cache: "no-store" });
        const data: { connected: boolean } = await response.json();
        setConnected(data.connected);
      } catch {
        setConnected(false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    if (!connected) {
      setDrivePhotos([]);
      setScreeningSummary("");
      return;
    }

    const loadDriveImages = async () => {
      setLoadingDrive(true);
      try {
        const response = await fetch("/api/drive/images?pageSize=120", { cache: "no-store" });
        if (!response.ok) {
          setDrivePhotos([]);
          setScreeningSummary("");
          return;
        }
        const data: DriveImagesResponse = await response.json();
        const screeningResponse = await fetch("/api/screening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: data.items ?? [] }),
        });

        if (!screeningResponse.ok) {
          setDrivePhotos([]);
          setScreeningSummary("");
          return;
        }

        const screened: ScreeningResponse = await screeningResponse.json();
        setDrivePhotos(mapScreenedDriveItemsToPhotoItems(screened.items ?? []));
        setScreeningSummary(
          `${screened.stats.outputCount}枚表示（ベスト${screened.stats.bestCount}/良い感じ${screened.stats.goodCount}/ワンチャン${screened.stats.chanceCount}・評価:${screened.stats.scoringMode}）`,
        );
      } catch {
        setDrivePhotos([]);
        setScreeningSummary("");
      } finally {
        setLoadingDrive(false);
      }
    };

    loadDriveImages();
  }, [connected]);

  const sourcePhotos = drivePhotos.length > 0 ? drivePhotos : photos;

  const monthOptions = useMemo(() => {
    const unique = new Set(sourcePhotos.map((photo) => photo.date.slice(0, 7)));
    return [...unique].sort((a, b) => b.localeCompare(a));
  }, [sourcePhotos]);

  const filteredPhotos = useMemo(() => {
    const byTab = activeTab === "all" ? sourcePhotos : sourcePhotos.filter((photo) => photo.rank === activeTab);
    const byCategory = category === "all" ? byTab : byTab.filter((photo) => photo.category === category);
    const byDate = dateFilter === "all" ? byCategory : byCategory.filter((photo) => photo.date.startsWith(dateFilter));
    const sorted = [...byDate].sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return sorted;
  }, [activeTab, category, dateFilter, sortBy, sourcePhotos]);

  const togglePhoto = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
      return;
    }

    if (selectedIds.length >= 3) {
      return;
    }

    setSelectedIds((prev) => [...prev, id]);
  };

  const moveToEditor = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedPhotos = sourcePhotos.filter((photo) => selectedIds.includes(photo.id));
    setSelectedPhotosStorage(selectedPhotos);

    const params = new URLSearchParams({ ids: selectedIds.join(",") });
    router.push(`/editor?${params.toString()}`);
  };

  const connectGoogleDrive = () => {
    window.location.href = "/api/auth/google";
  };

  const disconnectGoogleDrive = async () => {
    await fetch("/api/auth/disconnect", { method: "POST" });
    setConnected(false);
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <h1 className="text-2xl font-semibold text-slate-900">My Archive</h1>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">接続済み</span>
                <AppButton variant="secondary" onClick={disconnectGoogleDrive}>
                  解除
                </AppButton>
              </>
            ) : (
              <AppButton variant="secondary" onClick={connectGoogleDrive}>
                Google Driveを選択
              </AppButton>
            )}
          </div>
        </header>

        <section className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            {rankTabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-500 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category | "all")}
            >
              <option value="all">カテゴリ: すべて</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  カテゴリ: {item}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="all">日付: すべて</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  日付: {month}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "score" | "date")}
            >
              <option value="score">並び替え: スコア</option>
              <option value="date">並び替え: 日付</option>
            </select>
          </div>

          {connected && screeningSummary && <p className="text-xs text-slate-500">{screeningSummary}</p>}
        </section>

        <section className="grid grid-cols-3 gap-4 xl:grid-cols-4">
          {loadingDrive && connected && (
            <p className="col-span-full text-sm text-slate-500">Google Driveの画像を読み込み中...</p>
          )}
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              selected={selectedIds.includes(photo.id)}
              onClick={() => togglePhoto(photo.id)}
            />
          ))}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <p className="text-sm text-slate-600">{selectedIds.length}/3 枚選択中</p>
          <AppButton disabled={selectedIds.length === 0} onClick={moveToEditor}>
            選択して次へ（最大3枚）
          </AppButton>
        </div>
      </div>
    </div>
  );
}
