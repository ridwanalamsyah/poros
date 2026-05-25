import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Article, Author } from "../types";
import { getArticlesByAuthor } from "../data/api";
import { SmartImage } from "./SmartImage";

type Props = {
  author: Author;
};

const cache = new Map<string, Article[]>();

export function AuthorPopover({ author }: Props) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>(cache.get(author.slug) ?? []);
  const wrap = useRef<HTMLSpanElement | null>(null);
  const closeT = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (cache.has(author.slug)) {
      setArticles(cache.get(author.slug)!);
      return;
    }
    let cancelled = false;
    getArticlesByAuthor(author.slug).then((list) => {
      if (cancelled) return;
      const top = list.slice(0, 3);
      cache.set(author.slug, top);
      setArticles(top);
    });
    return () => {
      cancelled = true;
    };
  }, [open, author.slug]);

  function schedule(close: boolean) {
    if (closeT.current) window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setOpen(!close), close ? 160 : 0);
  }

  return (
    <span ref={wrap} className="relative inline-block" onMouseEnter={() => schedule(false)} onMouseLeave={() => schedule(true)}>
      <Link
        to={`/author/${author.slug}`}
        className="hover-underline"
        onFocus={() => setOpen(true)}
        onBlur={() => schedule(true)}
        aria-describedby={`author-pop-${author.slug}`}
      >
        {author.name}
      </Link>
      {open && (
        <span
          id={`author-pop-${author.slug}`}
          role="dialog"
          className="absolute left-0 top-full mt-2 w-72 z-40 bg-paper border rule p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] block normal-case"
          style={{ fontWeight: 400, letterSpacing: 0 }}
        >
          <span className="flex items-start gap-3">
            <span className="w-12 h-12 rounded-full overflow-hidden bg-ink/[0.06] shrink-0 block">
              <SmartImage image={author.image} className="w-full h-full" width={120} />
            </span>
            <span className="block min-w-0">
              <span className="headline-display text-lg block leading-tight">{author.name}</span>
              {author.bio && <span className="text-xs text-muted mt-1 block line-clamp-3">{author.bio}</span>}
            </span>
          </span>
          {articles.length > 0 && (
            <span className="mt-3 pt-3 border-t rule-soft block">
              <span className="kicker text-muted block mb-1">TULISAN TERAKHIR</span>
              <span className="block space-y-1">
                {articles.map((a) => (
                  <Link key={a._id} to={`/article/${a.slug}`} className="block text-sm hover-underline truncate">
                    {a.title}
                  </Link>
                ))}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
