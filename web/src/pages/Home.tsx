import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticles, getEditions } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleListSkeleton, HeroSkeleton } from "../components/Skeleton";
import { SEO } from "../components/SEO";
import type { Article } from "../types";

type Tab = "latest" | "commented";
const PAGE_SIZE = 6;

function commentsOf(a: Article) {
  return Math.max(0, Math.round((a.views ?? 0) / 110));
}

export function Home() {
  const { data: articles, loading } = useAsync(() => getArticles(40), []);
  const { data: editions } = useAsync(() => getEditions(), []);
  const [tab, setTab] = useState<Tab>("latest");
  const [shown, setShown] = useState(PAGE_SIZE);

  const all = articles ?? [];
  const hero = all[0];
  const features = all.slice(1, 4);
  const feedSource = useMemo(() => all.slice(4), [all]);

  const sorted = useMemo<Article[]>(() => {
    if (tab === "commented") {
      return [...feedSource].sort((a, b) => commentsOf(b) - commentsOf(a));
    }
    return [...feedSource].sort((a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0));
  }, [feedSource, tab]);

  const popular = useMemo<Article[]>(() => [...all].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5), [all]);
  const feed = sorted.slice(0, shown);
  const canLoadMore = sorted.length > shown;

  return (
    <>
      <SEO />

      {/* Hero + From the editors */}
      {loading ? (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-8">
          <HeroSkeleton />
        </section>
      ) : hero ? (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-8">
          <div className="grid md:grid-cols-12 gap-8 md:gap-10">
            <div className="md:col-span-8">
              <ArticleCard article={hero} variant="hero" />
            </div>
            <aside className="md:col-span-4 md:border-l rule-soft md:pl-8 lg:pl-10 flex flex-col gap-7 md:gap-8">
              <div className="border-b rule-soft pb-2">
                <h3 className="kicker text-accent">FROM THE EDITORS</h3>
              </div>
              {features.map((a) => (
                <ArticleCard key={a._id} article={a} variant="row" />
              ))}
            </aside>
          </div>
        </section>
      ) : null}

      {/* Current edition */}
      {!loading && editions && editions.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
          <div className="border-l-2 border-accent pl-4 md:pl-6">
            <p className="kicker text-accent">CURRENT EDITION · ISSUE {editions[0].issueNumber}</p>
            <Link to={`/edition/${editions[0].slug}`} className="block group">
              <h3 className="headline-display text-3xl md:text-5xl mt-2 group-hover:opacity-80 leading-[1.05]">{editions[0].title}</h3>
              {editions[0].description && <p className="text-muted mt-3 max-w-2xl">{editions[0].description}</p>}
            </Link>
            <div className="mt-3"><Link to="/editions" className="kicker hover-underline text-muted">VIEW ALL EDITIONS →</Link></div>
          </div>
        </section>
      )}

      {/* Feed with tabs (Consumed: Latest / Commented) */}
      {loading ? (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-12 md:pt-16">
          <ArticleListSkeleton />
        </section>
      ) : sorted.length > 0 ? (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-12 md:pt-16">
          <div className="border-b rule pb-3 flex items-end gap-6">
            {(["latest", "commented"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setShown(PAGE_SIZE); }}
                className={`kicker tracking-[0.18em] pb-1 transition-opacity ${tab === t ? "opacity-100 border-b-2 border-ink -mb-[13px]" : "opacity-50 hover:opacity-80"}`}
              >
                {t === "latest" ? "LATEST" : "COMMENTED"}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-12 gap-8 md:gap-12 pt-3">
            <div className="md:col-span-8">
              {feed.map((a) => (
                <ArticleCard key={a._id} article={a} variant="row" />
              ))}
              {canLoadMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                    className="kicker tracking-[0.2em] border border-ink/80 dark:border-paper/60 px-7 py-3 hover:bg-ink hover:text-paper transition-colors"
                  >
                    LOAD MORE
                  </button>
                </div>
              )}
            </div>

            {/* Popular sidebar */}
            <aside className="md:col-span-4 md:border-l rule-soft md:pl-8 lg:pl-10">
              <div className="border-b rule-soft pb-2 mb-4 mt-3">
                <h3 className="kicker text-accent">MOST POPULAR</h3>
              </div>
              <ol className="space-y-5">
                {popular.map((a, i) => (
                  <li key={a._id} className="flex items-start gap-3">
                    <span className="font-logo text-accent text-3xl leading-none shrink-0" style={{ fontFamily: "Pirata One, serif" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <Link to={`/article/${a.slug}`} className="headline-display text-lg leading-snug hover-underline block">{a.title}</Link>
                      <p className="text-[0.72rem] text-muted mt-1">{(a.views ?? 0).toLocaleString()} Views</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10 border-t rule-soft pt-6">
                <h3 className="kicker text-accent mb-2">FROM THE NOTEBOOK</h3>
                <p className="text-sm text-muted">Catatan-catatan pendek dari redaksi Velvet Collapse — antara dua edisi.</p>
                <Link to="/notes" className="kicker hover-underline inline-block mt-3">READ NOTES →</Link>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </>
  );
}
