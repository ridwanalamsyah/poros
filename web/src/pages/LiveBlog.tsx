import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getLiveBlog, getLiveBlogs } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { formatDate } from "../utils/text";

function LiveBadge({ status }: { status?: string }) {
  const live = status !== "ended";
  return (
    <span className={`kicker inline-flex items-center gap-1.5 ${live ? "text-accent" : "text-muted"}`}>
      {live && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />}
      {live ? "LIVE" : "ENDED"}
    </span>
  );
}

function entryTime(ts: string, locale = "id-ID"): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function LiveBlogsPage() {
  const { data: blogs } = useAsync(() => getLiveBlogs(), []);
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Live" description="Live coverage from Velvet Collapse — reporting events as they unfold." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">LIVE</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Live coverage.</h1>
        <p className="text-muted mt-3 max-w-2xl">Reporting events as they unfold — from the street, in real time.</p>
      </header>
      <ul className="divide-y rule-soft">
        {blogs?.map((b) => (
          <li key={b._id} className="py-6">
            <Link to={`/live/${b.slug}`} className="group block">
              <div className="flex items-center gap-3 mb-1">
                <LiveBadge status={b.status} />
                {b.startedAt && <span className="byline">{formatDate(b.startedAt)}</span>}
              </div>
              <h2 className="headline-display text-xl sm:text-2xl leading-tight group-hover:opacity-80">{b.title}</h2>
              {b.summary && <p className="text-muted mt-2 max-w-2xl">{b.summary}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LiveBlogPage() {
  const { slug = "" } = useParams();
  const { data: blog, loading } = useAsync(() => getLiveBlog(slug), [slug]);

  if (!blog && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="headline-display text-4xl">Live blog not found.</h1>
        <Link to="/live" className="kicker mt-6 inline-block hover-underline">← Back to live</Link>
      </div>
    );
  }

  const entries = blog?.entries ?? [];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title={blog?.title} description={blog?.summary} image={blog?.coverImage} />
      {blog && (
        <>
          <Link to="/live" className="kicker text-muted hover-underline">← LIVE</Link>
          <header className="mt-4 border-b rule-soft pb-8 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <LiveBadge status={blog.status} />
              {blog.startedAt && <span className="byline">Started {formatDate(blog.startedAt)}</span>}
            </div>
            <h1 className="headline-display text-3xl md:text-5xl leading-tight">{blog.title}</h1>
            {blog.summary && <p className="text-muted mt-3 max-w-2xl">{blog.summary}</p>}
          </header>
          {blog.coverImage && (
            <div className="aspect-[16/9] overflow-hidden bg-ink/[0.06] mb-8">
              <SmartImage image={blog.coverImage} className="w-full h-full" width={1200} />
            </div>
          )}
          <ol className="relative border-l-2 rule-soft pl-6 space-y-8">
            {entries.map((e) => (
              <li key={e._key ?? e.timestamp} className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-accent ring-4 ring-paper" aria-hidden="true" />
                <time className="stat text-accent tabular-nums">{entryTime(e.timestamp)}</time>
                {e.heading && <h3 className="headline-display text-xl mt-1 leading-tight">{e.heading}</h3>}
                <p className="mt-2 leading-relaxed">{e.body}</p>
                {e.author && (
                  <p className="byline mt-2">
                    <Link to={`/author/${e.author.slug}`} className="hover-underline text-ink">{e.author.name}</Link>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
