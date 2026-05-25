import { useAsync } from "../hooks/useAsync";
import { useBookmarks } from "../hooks/useBookmarks";
import { getArticles } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { SEO } from "../components/SEO";

export function SavedPage() {
  const { slugs } = useBookmarks();
  const { data: articles } = useAsync(() => getArticles(), []);
  const saved = (articles ?? []).filter((a) => slugs.includes(a.slug));

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Saved" description="Articles you've saved on Velvet Collapse." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">SAVED</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Saved reads.</h1>
      </header>
      <div className="mb-8 border rule-soft p-4 bg-ink/[0.03] text-sm">
        <p className="kicker text-accent mb-1">NOTE</p>
        <p>
          Bookmarks are stored in this browser only — there are no accounts yet.
          If you switch device or clear cookies, this list disappears.
          Accounts and cross-device sync are coming soon.
        </p>
      </div>
      {saved.length === 0 ? (
        <p className="text-muted">No saved articles yet. Click the "Save" button on any article to add it here.</p>
      ) : (
        saved.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)
      )}
    </div>
  );
}
