import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticlesByEdition, getEdition, getEditions } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { ArticleCard } from "../components/ArticleCard";
import { SEO } from "../components/SEO";
import { formatDate } from "../utils/text";

export function EditionsPage() {
  const { data: editions } = useAsync(() => getEditions(), []);
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title="Editions" description="Arsip semua edisi POROS." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">EDITIONS</p>
        <h1 className="headline-display text-4xl md:text-6xl mt-2">Arsip Edisi</h1>
      </header>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {editions?.map((e) => (
          <Link key={e._id} to={`/edition/${e.slug}`} className="block group">
            <div className="aspect-[4/3] mb-4 bg-ink/[0.05] overflow-hidden">
              <SmartImage image={e.coverImage} className="w-full h-full transition-transform group-hover:scale-[1.03]" width={800} />
            </div>
            <p className="kicker text-muted">ISSUE {e.issueNumber} · {formatDate(e.publishedAt)}</p>
            <h2 className="headline-display text-3xl mt-2 group-hover:opacity-80">{e.title}</h2>
            {e.description && <p className="mt-2 text-muted">{e.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function EditionPage() {
  const { slug = "" } = useParams();
  const { data: edition } = useAsync(() => getEdition(slug), [slug]);
  const { data: articles } = useAsync(() => getArticlesByEdition(slug), [slug]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title={edition?.title} description={edition?.description} image={edition?.coverImage} />
      {edition && (
        <header className="border-b rule-soft pb-8 mb-10">
          <p className="kicker text-accent">ISSUE {edition.issueNumber}</p>
          <h1 className="headline-display text-4xl md:text-6xl mt-2">{edition.title}</h1>
          {edition.description && <p className="text-muted mt-4 max-w-2xl text-lg">{edition.description}</p>}
          <p className="byline mt-3">{formatDate(edition.publishedAt)}</p>
        </header>
      )}
      <div className="md:hidden">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)}</div>
      <div className="hidden md:grid md:grid-cols-3 gap-10">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="default" />)}</div>
    </div>
  );
}
