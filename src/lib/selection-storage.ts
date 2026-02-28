import { PhotoItem } from "@/lib/photo-types";

const STORAGE_KEY = "selected_photos";

export function setSelectedPhotosStorage(photos: PhotoItem[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function getSelectedPhotosStorage(): PhotoItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PhotoItem[];
  } catch {
    return [];
  }
}
