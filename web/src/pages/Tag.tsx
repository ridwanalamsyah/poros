import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getAllTags, getArticlesByTag } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleListSkeleton } from "../components/Skeleton";
import { SEO } from "../components/SEO";

export function TagPage() {
  const { tag = "" } = useParams();
  const { data: articles, loading } = useAsync(() => getArticlesByTag(tag), [tag]);
  const { data: allTags } = useAsync(() => getAllTags(), []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title={`#${tag}`} description={`Velvet Collapse articles tagged #${tag}.`} />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">TAG</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">#{tag}</h1>
      </header>
      {loading ? <ArticleListSkeleton /> : (
        <>
          <div className="md:hidden">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)}</div>
          <div className="hidden md:grid md:grid-cols-3 gap-10">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="default" />)}</div>
        </>
      )}
      {allTags && allTags.length > 0 && (
        <section className="mt-16 pt-8 border-t rule-soft">
          <h2 className="kicker mb-4">ALL TAGS</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ tag: t, count }) => (
              <Link key={t} to={`/tag/${t}`} className={`text-xs uppercase tracking-widest border rule-soft px-2 py-1 hover:bg-ink/[0.05] ${t === tag ? "bg-ink text-paper border-ink" : ""}`}>
                #{t}{count > 0 && <span className="ml-1 opacity-60">{count}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
