import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticlesByEdition } from "../data/api";
import type { Article } from "../types";

/** Reader panel for an article that belongs to an edition: a table of contents
 * for the issue plus prev/next navigation scoped to that edition. */
export function EditionReader({ article }: { article: Article }) {
  const edition = article.edition;
  const { data: items } = useAsync(
    () => (edition ? getArticlesByEdition(edition.slug) : Promise.resolve([])),
    [edition?.slug],
  );

  if (!edition || !items || items.length < 2) return null;

  const idx = items.findIndex((a) => a._id === article._id);
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;

  return (
    <section className="mt-12 pt-8 border-t rule-soft" aria-label={`In this edition: ${edition.title}`}>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <Link to={`/edition/${edition.slug}`} className="kicker text-accent hover-underline">
          IN THIS EDITION · ISSUE {edition.issueNumber}
        </Link>
        {idx >= 0 && <span className="stat opacity-60">{idx + 1} / {items.length}</span>}
      </div>
      <ol className="space-y-1.5">
        {items.map((a, i) => {
          const current = a._id === article._id;
          return (
            <li key={a._id} className="flex gap-3">
              <span className="stat opacity-50 tabular-nums shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
              {current ? (
                <span className="font-medium" aria-current="true">{a.title}</span>
              ) : (
                <Link to={`/article/${a.slug}`} className="text-muted hover:text-ink hover-underline">{a.title}</Link>
              )}
            </li>
          );
        })}
      </ol>
      {(prev || next) && (
        <nav className="mt-6 grid sm:grid-cols-2 gap-6">
          {prev ? (
            <Link to={`/article/${prev.slug}`} className="block group">
              <p className="kicker text-muted mb-1">← EARLIER IN ISSUE</p>
              <h4 className="headline-display text-lg group-hover:opacity-80">{prev.title}</h4>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/article/${next.slug}`} className="block group sm:text-right">
              <p className="kicker text-muted mb-1">LATER IN ISSUE →</p>
              <h4 className="headline-display text-lg group-hover:opacity-80">{next.title}</h4>
            </Link>
          ) : <div />}
        </nav>
      )}
    </section>
  );
}
