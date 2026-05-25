import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getNewsletters } from "../data/api";
import { SEO } from "../components/SEO";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { formatDate } from "../utils/text";

export function NewsletterPage() {
  const { data: issues, loading } = useAsync(() => getNewsletters(), []);
  const list = issues ?? [];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-12">
      <SEO title="Newsletter" description="Arsip newsletter Velvet Collapse Magazine. Daftar gratis untuk dapat kiriman mingguan." />

      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">NEWSLETTER</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Kiriman mingguan.</h1>
        <p className="text-muted mt-3 max-w-2xl">
          Catatan editor, daftar bacaan, artikel baru. Langsung ke inbox. Gratis, bisa unsubscribe kapan saja.
        </p>
      </header>

      <div className="border rule-soft p-5 mb-12">
        <NewsletterSignup variant="inline" />
      </div>

      <section>
        <h2 className="kicker text-muted mb-4">ARSIP</h2>
        {loading ? (
          <p className="text-muted">Memuat arsip…</p>
        ) : list.length === 0 ? (
          <p className="text-muted">Belum ada kiriman yang diarsipkan. Daftar di atas untuk dapat newsletter pertama.</p>
        ) : (
          <ul className="divide-y rule-soft">
            {list.map((n) => (
              <li key={n._id} className="py-5">
                <p className="kicker text-muted">{formatDate(n.sentAt)}</p>
                <h3 className="headline-display text-2xl mt-1">
                  {n.externalUrl ? (
                    <a href={n.externalUrl} target="_blank" rel="noreferrer" className="hover-underline">{n.title}</a>
                  ) : (
                    <Link to={`/newsletter/${n.slug}`} className="hover-underline">{n.title}</Link>
                  )}
                </h3>
                {n.summary && <p className="text-muted mt-1">{n.summary}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
