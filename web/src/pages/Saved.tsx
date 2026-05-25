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
      <SEO title="Saved" description="Artikel yang kamu simpan di Velvet Collapse Magazine." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">SAVED</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Bacaan tersimpan.</h1>
      </header>
      <div className="mb-8 border rule-soft p-4 bg-ink/[0.03] text-sm">
        <p className="kicker text-accent mb-1">CATATAN</p>
        <p>
          Bookmark di-simpan di browser ini saja — belum ada akun.
          Kalau kamu ganti device atau hapus cookie, list ini ikut hilang.
          Akun & sync antar-device segera datang.
        </p>
      </div>
      {saved.length === 0 ? (
        <p className="text-muted">Belum ada artikel yang disimpan. Klik tombol "Save" di artikel untuk menyimpannya di sini.</p>
      ) : (
        saved.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)
      )}
    </div>
  );
}
