import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { useBookmarks } from "../hooks/useBookmarks";
import { getArticles } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { SEO } from "../components/SEO";
import { getSavedHighlights, removeSavedHighlight, type SavedHighlight } from "../components/HighlightShare";
import { formatDate } from "../utils/text";

export function SavedPage() {
  const { slugs } = useBookmarks();
  const { data: articles } = useAsync(() => getArticles(), []);
  const saved = (articles ?? []).filter((a) => slugs.includes(a.slug));
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);

  useEffect(() => {
    setHighlights(getSavedHighlights());
  }, []);

  function remove(id: string) {
    removeSavedHighlight(id);
    setHighlights(getSavedHighlights());
  }

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

      <section className="mb-12">
        <h2 className="kicker text-muted mb-3">ARTIKEL ({saved.length})</h2>
        {saved.length === 0 ? (
          <p className="text-muted">Belum ada artikel yang disimpan. Klik tombol "Save" di artikel untuk menyimpannya di sini.</p>
        ) : (
          saved.map((a) => <ArticleCard key={a._id} article={a} variant="row" />)
        )}
      </section>

      <section>
        <h2 className="kicker text-muted mb-3">KUTIPAN ({highlights.length})</h2>
        {highlights.length === 0 ? (
          <p className="text-muted text-sm">Belum ada kutipan tersimpan. Sorot teks di artikel lalu klik "Simpan".</p>
        ) : (
          <ul className="space-y-4">
            {highlights.map((h) => (
              <li key={h.id} className="border rule-soft p-4 bg-paper">
                <blockquote className="font-serif italic leading-snug">“{h.text}”</blockquote>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {h.slug ? (
                    <Link to={`/article/${h.slug}`} className="kicker hover-underline">{h.title}</Link>
                  ) : (
                    <a href={h.url} className="kicker hover-underline">{h.title}</a>
                  )}
                  <span className="byline">{formatDate(new Date(h.ts).toISOString())}</span>
                  <button onClick={() => remove(h.id)} className="kicker text-muted hover:text-accent">HAPUS</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
