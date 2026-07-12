import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticle, getArticles } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { ReadingProgress } from "../components/ReadingProgress";
import { HighlightShare } from "../components/HighlightShare";
import { ShareBar } from "../components/ShareBar";
import { PortableBody } from "../components/PortableBody";
import { ReadingControls } from "../components/ReadingControls";
import { Comments } from "../components/Comments";
import { Reactions } from "../components/Reactions";
import { AuthorPopover } from "../components/AuthorPopover";
import { RelatedArticles } from "../components/RelatedArticles";
import { EditionReader } from "../components/EditionReader";
import { blocksToPlainText, formatDate, readingMinutes } from "../utils/text";

export function ArticlePage() {
  const { slug = "" } = useParams();
  const { data: article, loading } = useAsync(() => getArticle(slug), [slug]);
  const { data: allArticles } = useAsync(() => getArticles(), []);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-0 py-10 space-y-4">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton aspect-[16/9]" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-5/6" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="kicker text-muted">404</p>
        <h1 className="headline-display text-4xl mt-4">Article not found.</h1>
        <Link to="/" className="kicker mt-6 inline-block hover-underline">← Back to home</Link>
      </div>
    );
  }

  const plain = blocksToPlainText(article.body);
  const minutes = readingMinutes(plain);

  const list = allArticles ?? [];
  const idx = list.findIndex((a) => a._id === article._id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt ?? plain.slice(0, 160)}
        image={article.coverImage}
        type="article"
        publishedAt={article.publishedAt}
        author={article.author?.name}
        authorUrl={article.author?.slug ? `/author/${article.author.slug}` : undefined}
        url={`/article/${article.slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          ...(article.category ? [{ name: article.category.title, url: `/category/${article.category.slug}` }] : []),
          { name: article.title, url: `/article/${article.slug}` },
        ]}
      />
      <ReadingProgress />

      <article className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-12">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {article.category && <Link to={`/category/${article.category.slug}`} className="kicker text-accent hover-underline">{article.category.title}</Link>}
            {article.edition && <Link to={`/edition/${article.edition.slug}`} className="kicker text-muted hover-underline">· ISSUE {article.edition.issueNumber}</Link>}
            {article.editorsPick && <span className="kicker text-muted">· EDITOR'S PICK</span>}
          </div>
          <h1 className="headline-display text-4xl md:text-6xl leading-[0.96]">{article.title}</h1>
          {article.excerpt && <p className="mt-4 text-muted text-lg md:text-xl">{article.excerpt}</p>}
          <div className="mt-5 byline flex items-center gap-2 flex-wrap">
            {article.author && <AuthorPopover author={article.author} />}
            <span>·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>·</span>
            <span>{minutes} min read</span>
          </div>
        </header>

        {article.coverImage && (
          <figure className="mb-8">
            <SmartImage image={article.coverImage} className="w-full h-[42vh] sm:h-[52vh] md:h-[65vh] bg-ink/[0.03]" fit="contain" width={1600} loading="eager" />
            {article.coverImage.caption && <figcaption className="byline italic mt-2">{article.coverImage.caption}</figcaption>}
          </figure>
        )}

        <ReadingControls slug={article.slug} articleText={`${article.title}. ${plain}`} />

        <div ref={bodyRef as React.RefObject<HTMLDivElement>}>
          {article.body && article.body.length > 0 ? (
            <PortableBody blocks={article.body} />
          ) : article.excerpt ? (
            <div className="article-body"><p>{article.excerpt}</p></div>
          ) : null}
        </div>

        <HighlightShare containerRef={bodyRef as React.RefObject<HTMLElement>} title={article.title} slug={article.slug} />

        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t rule-soft flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Link key={t} to={`/tag/${t}`} className="text-xs uppercase tracking-widest border rule-soft px-2 py-1 hover:bg-ink/[0.05]">#{t}</Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <ShareBar url={`/article/${article.slug}`} title={article.title} slug={article.slug} />
        </div>

        <Reactions articleId={article._id} initialCounts={article.reactionCounts} />

        <EditionReader article={article} />

        {article.author && (
          <div className="mt-12 pt-8 border-t rule-soft flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
              <SmartImage image={article.author.image} className="w-full h-full" width={200} />
            </div>
            <div>
              <p className="kicker text-muted">AUTHOR</p>
              <Link to={`/author/${article.author.slug}`} className="headline-display text-2xl mt-1 inline-block hover-underline">{article.author.name}</Link>
              {article.author.bio && <p className="text-sm text-muted mt-2 max-w-prose">{article.author.bio}</p>}
            </div>
          </div>
        )}

        <RelatedArticles current={article} pool={list} />

        <Comments pageId={article._id} pageUrl={typeof window !== "undefined" ? window.location.href : ""} pageTitle={article.title} />

        <nav className="mt-12 grid sm:grid-cols-2 gap-6 border-t rule-soft pt-8">
          {prev ? (
            <Link to={`/article/${prev.slug}`} className="block group">
              <p className="kicker text-muted mb-1">← PREVIOUS</p>
              <h4 className="headline-display text-xl group-hover:opacity-80">{prev.title}</h4>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/article/${next.slug}`} className="block group text-right sm:text-right">
              <p className="kicker text-muted mb-1">NEXT →</p>
              <h4 className="headline-display text-xl group-hover:opacity-80">{next.title}</h4>
            </Link>
          ) : <div />}
        </nav>
      </article>
    </>
  );
}
