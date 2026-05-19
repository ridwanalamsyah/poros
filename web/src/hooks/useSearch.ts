import { useEffect, useState } from "react";
import { getArticles } from "../data/api";
import type { Article } from "../types";

export function useArticleSearch(q: string) {
  const [all, setAll] = useState<Article[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getArticles().then((a) => { if (!cancelled) setAll(a); });
    return () => { cancelled = true; };
  }, []);
  const query = q.trim().toLowerCase();
  const results = !query
    ? []
    : (all ?? []).filter((a) => {
        const hay = [a.title, a.excerpt, a.author?.name, a.category?.title, ...(a.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      }).slice(0, 20);
  return { results };
}
