import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticlesByAuthor, getAuthor } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { ArticleCard } from "../components/ArticleCard";
import { SEO } from "../components/SEO";

export function AuthorPage() {
  const { slug = "" } = useParams();
  const { data: author } = useAsync(() => getAuthor(slug), [slug]);
  const { data: articles, loading } = useAsync(() => getArticlesByAuthor(slug), [slug]);

  if (!author && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="headline-display text-4xl">Author not found.</h1>
        <Link to="/" className="kicker mt-6 inline-block hover-underline">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title={author?.name} description={author?.bio} image={author?.image} />
      {author && (
        <header className="border-b rule-soft pb-8 mb-10 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
            <SmartImage image={author.image} className="w-full h-full" width={400} />
          </div>
          <div className="flex-1">
            <p className="kicker text-accent">AUTHOR</p>
            <h1 className="headline-display text-4xl md:text-5xl mt-2">{author.name}</h1>
            {author.bio && <p className="text-muted mt-4 max-w-2xl">{author.bio}</p>}
            <div className="mt-4 flex gap-4 text-sm">
              {author.instagram && <a className="hover-underline" target="_blank" rel="noreferrer" href={`https://instagram.com/${author.instagram}`}>Instagram</a>}
              {author.website && <a className="hover-underline" target="_blank" rel="noreferrer" href={author.website}>Website</a>}
            </div>
          </div>
        </header>
      )}
      <div className="md:hidden">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)}</div>
      <div className="hidden md:grid md:grid-cols-3 gap-10">{articles?.map((a) => <ArticleCard key={a._id} article={a} variant="default" />)}</div>
    </div>
  );
}
