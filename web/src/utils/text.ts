import type { PortableTextBlock } from "../types";

export function blocksToPlainText(blocks?: PortableTextBlock[] | undefined): string {
  if (!blocks) return "";
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => {
      const children = (b as { children?: { text?: string }[] }).children ?? [];
      return children.map((c) => c.text ?? "").join("");
    })
    .join("\n\n");
}

export function readingMinutes(text: string, wpm = 220): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

export function formatDate(d?: string, locale = "id-ID"): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function relativeTime(d?: string, now = Date.now()): string {
  if (!d) return "";
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return d;
  const diff = Math.max(0, now - t);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  if (diff < hour) {
    const m = Math.max(1, Math.round(diff / (60 * 1000)));
    return `${m} minute${m > 1 ? "s" : ""} ago`;
  }
  if (diff < day) {
    const h = Math.max(1, Math.round(diff / hour));
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }
  if (diff < week) {
    const d2 = Math.max(1, Math.round(diff / day));
    return `${d2} day${d2 > 1 ? "s" : ""} ago`;
  }
  if (diff < month) {
    const w = Math.max(1, Math.round(diff / week));
    return `${w} week${w > 1 ? "s" : ""} ago`;
  }
  if (diff < year) {
    const mo = Math.max(1, Math.round(diff / month));
    return `${mo} month${mo > 1 ? "s" : ""} ago`;
  }
  const y = Math.max(1, Math.round(diff / year));
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

export function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  labor: [
    "https://images.unsplash.com/photo-1542013936693-884638332954?w=1200",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
  ],
  society: [
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200",
    "https://images.unsplash.com/photo-1530519729491-c7fe5ee23ff8?w=1200",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200",
    "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1200",
  ],
  culture: [
    "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1200",
    "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=1200",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200",
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200",
  ],
  music: [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
  ],
  default: [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200",
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200",
    "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1200",
  ],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fallbackCover(categorySlug?: string, key?: string): string {
  const bucket =
    (categorySlug && CATEGORY_FALLBACKS[categorySlug.toLowerCase()]) ||
    CATEGORY_FALLBACKS.default;
  const idx = key ? hashString(key) % bucket.length : 0;
  return bucket[idx];
}
