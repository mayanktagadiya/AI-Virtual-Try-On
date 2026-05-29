import type { TryOnResult } from "@/types/tryon";

export interface GalleryItem {
  id: string;
  timestamp: number;
  result: TryOnResult;
  garmentName?: string;
}

const KEY = "tryon_gallery";
const MAX_ITEMS = 12;

export function loadGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GalleryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveToGallery(result: TryOnResult, garmentName?: string): GalleryItem {
  const item: GalleryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    result,
    garmentName,
  };
  try {
    const items = loadGallery();
    const updated = [item, ...items].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // quota exceeded — silently ignore
  }
  return item;
}

export function deleteFromGallery(id: string): void {
  const items = loadGallery().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearGallery(): void {
  localStorage.removeItem(KEY);
}
