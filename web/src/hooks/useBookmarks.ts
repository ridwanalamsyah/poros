import { useCallback, useEffect, useState } from "react";

const KEY = "poros-bookmarks";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event("poros-bookmarks"));
}

export function useBookmarks(): { slugs: string[]; toggle: (slug: string) => void; has: (slug: string) => boolean } {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
    const onUpdate = () => setSlugs(read());
    window.addEventListener("poros-bookmarks", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("poros-bookmarks", onUpdate);
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
