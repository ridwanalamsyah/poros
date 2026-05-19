import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticlesByCategory, getCategory } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleListSkeleton } from "../components/Skeleton";
import { SEO } from "../components/SEO";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { data: category } = useAsync(() => getCategory(slug), [slug]);
  const { data: articles, loading } = useAsync(() => getArticlesByCategory(slug), [slug]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title={category?.title} description={category?.description} />
      <header className="border-b rule-soft pb-6 md:pb-10 mb-10">
        <p className="kicker text-accent">{category?.title ?? "CATEGORY"}</p>
        {category?.description && <h1 className="headline-display text-3xl md:text-5xl mt-3 max-w-3xl">{category.description}</h1>}
      </header>
      {loading ? <ArticleListSkeleton /> : (
        <>
          <div className="md:hidden">
            {articles?.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)}
          </div>
          <div className="hidden md:grid md:grid-cols-3 gap-10">
            {articles?.map((a) => <ArticleCard key={a._id} article={a} variant="default" />)}
          </div>
          {articles && articles.length === 0 && (
            <p className="text-muted">Belum ada artikel di kategori ini.</p>
          )}
        </>
      )}
    </div>
  );
}
