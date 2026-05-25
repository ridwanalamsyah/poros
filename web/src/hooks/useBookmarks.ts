import { useCallback, useEffect, useState } from "react";

const KEY = "vc-bookmarks";
const LEGACY_KEY = "poros-bookmarks";
const EVENT = "vc-bookmarks";
const LEGACY_EVENT = "poros-bookmarks";

function migrateOnce(): void {
  try {
    if (localStorage.getItem(KEY) !== null) return;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      localStorage.setItem(KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {}
}

function read(): string[] {
  try {
    migrateOnce();
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(EVENT));
  window.dispatchEvent(new Event(LEGACY_EVENT));
}

export function useBookmarks(): { slugs: string[]; toggle: (slug: string) => void; has: (slug: string) => boolean } {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
    const onUpdate = () => setSlugs(read());
    window.addEventListener(EVENT, onUpdate);
    window.addEventListener(LEGACY_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVENT, onUpdate);
      window.removeEventListener(LEGACY_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    write(next);
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, has };
}
