import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticlesByCategory, getArticles } from "../data/api";
import { SmartImage } from "./SmartImage";
import type { Article } from "../types";
import { formatDate } from "../utils/text";

type Props = {
  article: Article;
  limit?: number;
};

export function RelatedArticles({ article, limit = 3 }: Props) {
  const [list, setList] = useState<Article[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let pool: Article[] = [];
      if (article.category?.slug) {
        pool = await getArticlesByCategory(article.category.slug);
      }
      if (pool.length <= 1) {
        pool = await getArticles();
      }
      const filtered = pool.filter((a) => a._id !== article._id).slice(0, limit);
      if (!cancelled) setList(filtered);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [article._id, article.category?.slug, limit]);

  if (list.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t rule">
      <h2 className="kicker text-muted mb-4">BACA JUGA</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {list.map((a) => (
          <Link key={a._id} to={`/article/${a.slug}`} className="group block">
            <div className="aspect-[4/3] bg-ink/[0.05] overflow-hidden mb-2">
              <SmartImage image={a.coverImage} className="w-full h-full group-hover:opacity-90 transition-opacity" width={500} />
            </div>
            {a.category && <p className="kicker text-accent">{a.category.title}</p>}
            <h3 className="headline mt-1 leading-snug group-hover:opacity-80">{a.title}</h3>
            <p className="byline mt-1">{formatDate(a.publishedAt)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
