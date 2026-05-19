import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getNotes } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { formatDate } from "../utils/text";

export function NotesPage() {
  const { data: notes } = useAsync(() => getNotes(), []);
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Notes" description="Catatan singkat dari redaksi POROS — link, quote, observasi." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">NOTES</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Catatan singkat dari redaksi.</h1>
      </header>
      <ul className="divide-y rule-soft">
        {notes?.map((n) => (
          <li key={n._id} className="py-6 flex gap-4">
            {n.author && (
              <Link to={`/author/${n.author.slug}`} className="w-10 h-10 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
                <SmartImage image={n.author.image} className="w-full h-full" width={120} />
              </Link>
            )}
            <div className="flex-1">
              <div className="byline flex gap-2 items-center">
                {n.author && <Link to={`/author/${n.author.slug}`} className="hover-underline text-ink">{n.author.name}</Link>}
                <span>· {formatDate(n.publishedAt)}</span>
              </div>
              <p className="mt-2 leading-relaxed">{n.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
