import { Link } from "react-router-dom";
import type { Article } from "../types";
import { SmartImage } from "./SmartImage";
import { blocksToPlainText, fallbackCover, readingMinutes, relativeTime } from "../utils/text";

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

function ConsumedMeta({ article }: { article: Article }) {
  const minutes = article.readingMinutes ?? readingMinutes(article.body ? blocksToPlainText(article.body) : article.excerpt ?? "");
  const author = article.author?.name ?? article.authors?.[0]?.name;
  return (
    <div className="text-[0.78rem] leading-snug text-muted flex flex-col gap-0.5">
      {(author || article.publishedAt) && (
        <span>
          {author && (
            <>
              By{" "}
              {article.author?.slug ? (
                <Link to={`/author/${article.author.slug}`} className="text-ink/80 dark:text-paper/80 hover-underline">{author}</Link>
              ) : (
                <span className="text-ink/80 dark:text-paper/80">{author}</span>
              )}
              {" / "}
            </>
          )}
          {article.publishedAt && <span>{relativeTime(article.publishedAt)}</span>}
        </span>
      )}
      <span>
        {article.views ? <>{fmt(article.views)} Views <span className="opacity-40">/</span> </> : null}{minutes} min read
      </span>
    </div>
  );
}

export function ArticleCard({ article, variant = "default" }: { article: Article; variant?: "default" | "compact" | "hero" | "row" | "feature" }) {
  const link = `/article/${article.slug}`;
  const cover = fallbackCover(article.category?.slug, article.slug);

  if (variant === "hero") {
    return (
      <Link to={link} className="group block lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
        <div className="aspect-[16/10] sm:aspect-[16/9] max-h-[48vh] sm:max-h-[52vh] lg:max-h-[60vh] mb-4 md:mb-5 lg:mb-0 lg:col-span-7 overflow-hidden">
          <SmartImage image={article.coverImage} fallbackUrl={cover} className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" width={1600} loading="eager" />
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-2">
            {article.category && <Link to={`/category/${article.category.slug}`} className="kicker text-accent hover:underline">{article.category.title}</Link>}
            {article.editorsPick && <span className="kicker text-muted">· EDITOR&apos;S PICK</span>}
          </div>
          <h2 className="headline-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.96] mb-3 group-hover:opacity-80">{article.title}</h2>
          {article.excerpt && <p className="deck max-w-2xl mb-3">{article.excerpt}</p>}
          <div className="mt-2"><ConsumedMeta article={article} /></div>
        </div>
      </Link>

    );
  }

  if (variant === "feature") {
    return (
      <Link to={link} className="group block">
        <div className="thumb-bw aspect-[4/3] mb-3 overflow-hidden">
          <SmartImage image={article.coverImage} fallbackUrl={cover} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" width={700} />
        </div>
        {article.category && <span className="kicker text-accent">{article.category.title}</span>}
        <h3 className="headline-display text-2xl md:text-3xl mt-1 group-hover:opacity-80 leading-[1.05]">{article.title}</h3>
        <div className="mt-2"><ConsumedMeta article={article} /></div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link to={link} className="group flex items-start gap-4 sm:gap-6 py-5 border-b rule-soft last:border-b-0 hover:opacity-95">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            {article.category && <span className="kicker text-accent">{article.category.title}</span>}
            {article.editorsPick && <span className="kicker text-muted">· EDITOR&apos;S PICK</span>}
          </div>
          <h3 className="headline-display text-xl sm:text-2xl md:text-[1.65rem] leading-[1.1] group-hover:opacity-80">{article.title}</h3>
          {article.excerpt && <p className="text-sm text-muted mt-2 line-clamp-2">{article.excerpt}</p>}
          <div className="mt-3"><ConsumedMeta article={article} /></div>
        </div>
        <div className="thumb-bw w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 overflow-hidden">
          <SmartImage image={article.coverImage} fallbackUrl={cover} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" width={500} />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={link} className="group block">
        <div className="thumb-bw aspect-[4/3] mb-3 overflow-hidden">
          <SmartImage image={article.coverImage} fallbackUrl={cover} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" width={600} />
        </div>
        {article.category && <span className="kicker text-muted">{article.category.title}</span>}
        <h3 className="headline-display text-2xl mt-1 group-hover:opacity-80 leading-[1.08]">{article.title}</h3>
        <div className="mt-2"><ConsumedMeta article={article} /></div>
      </Link>
    );
  }

  // default
  return (
    <Link to={link} className="group block">
      <div className="thumb-bw aspect-[16/10] mb-3 overflow-hidden">
        <SmartImage image={article.coverImage} fallbackUrl={cover} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" width={800} />
      </div>
      {article.category && <span className="kicker text-accent">{article.category.title}</span>}
      <h3 className="headline-display text-2xl md:text-3xl mt-1 group-hover:opacity-80 leading-[1.05]">{article.title}</h3>
      {article.excerpt && <p className="text-sm text-muted mt-2 line-clamp-2">{article.excerpt}</p>}
      <div className="mt-3"><ConsumedMeta article={article} /></div>
    </Link>
  );
}
