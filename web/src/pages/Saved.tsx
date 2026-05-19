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
    <div className="max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Saved" description="Artikel yang kamu simpan di POROS." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">SAVED</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Bacaan tersimpan.</h1>
        <p className="text-muted mt-2">Tersimpan di browser ini saja, tidak butuh login.</p>
      </header>
      {saved.length === 0 ? (
        <p className="text-muted">Belum ada artikel yang disimpan. Klik tombol "Save" di artikel untuk menyimpannya di sini.</p>
      ) : (
        saved.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)
      )}
    </div>
  );
}
