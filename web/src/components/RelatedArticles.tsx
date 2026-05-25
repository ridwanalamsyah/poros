import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types";
import { SmartImage } from "./SmartImage";
import { fallbackCover } from "../utils/text";

type Props = {
  current: Article;
  pool: Article[];
  limit?: number;
};

export function RelatedArticles({ current, pool, limit = 3 }: Props) {
  const items = useMemo<Article[]>(() => {
    const sameCat = pool.filter(
      (a) => a._id !== current._id && a.category?._id && a.category._id === current.category?._id,
    );
    const filler = pool.filter((a) => a._id !== current._id && !sameCat.includes(a));
    const sorted = [...sameCat, ...filler].sort(
      (a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0),
    );
    return sorted.slice(0, limit);
  }, [current, pool, limit]);

  if (items.length === 0) return null;

  return (
    <section className="mt-14 pt-8 border-t rule">
      <h3 className="kicker text-accent mb-6">KEEP READING</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a) => (
          <Link key={a._id} to={`/article/${a.slug}`} className="group block">
            <div className="aspect-[4/3] mb-3 overflow-hidden bg-ink/[0.04]">
              <SmartImage
                image={a.coverImage}
                fallbackUrl={fallbackCover(a.category?.slug, a.slug)}
                className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]"
                width={600}
              />
            </div>
            {a.category && <span className="kicker text-accent">{a.category.title}</span>}
            <h4 className="headline-display text-lg md:text-xl mt-1 leading-[1.15] group-hover:opacity-80">
              {a.title}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
