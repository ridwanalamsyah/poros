import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getEpisode, getEpisodes } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { formatDate } from "../utils/text";

export function PodcastPage() {
  const { data: episodes } = useAsync(() => getEpisodes(), []);
  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 md:pt-14 pb-10">
      <SEO title="Podcast" description="Velvet Collapse on air — conversations about labour, the city, and the underground." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">PODCAST</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Velvet Collapse, on air.</h1>
        <p className="text-muted mt-3 max-w-2xl">Conversations about labour, the city, and the underground — recorded in Bandung.</p>
      </header>
      <ul className="divide-y rule-soft">
        {episodes?.map((ep) => (
          <li key={ep._id} className="py-6">
            <Link to={`/podcast/${ep.slug}`} className="group grid grid-cols-[88px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 items-start">
              <div className="thumb-bw aspect-square overflow-hidden bg-ink/[0.06]">
                <SmartImage image={ep.coverImage} className="w-full h-full" width={300} />
              </div>
              <div>
                <p className="kicker text-muted">
                  {ep.episodeNumber != null && <span className="text-accent">EP {String(ep.episodeNumber).padStart(2, "0")}</span>}
                  {ep.publishedAt && <span> · {formatDate(ep.publishedAt)}</span>}
                  {ep.duration && <span> · {ep.duration}</span>}
                </p>
                <h2 className="headline-display text-xl sm:text-2xl mt-1 leading-tight group-hover:opacity-80">{ep.title}</h2>
                {ep.description && <p className="text-muted mt-2 line-clamp-2 max-w-2xl">{ep.description}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EpisodePage() {
  const { slug = "" } = useParams();
  const { data: episode, loading } = useAsync(() => getEpisode(slug), [slug]);

  if (!episode && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="headline-display text-4xl">Episode not found.</h1>
        <Link to="/podcast" className="kicker mt-6 inline-block hover-underline">← Back to podcast</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title={episode?.title} description={episode?.description} image={episode?.coverImage} />
      {episode && (
        <>
          <Link to="/podcast" className="kicker text-muted hover-underline">← PODCAST</Link>
          <header className="mt-4 border-b rule-soft pb-8 mb-8">
            <p className="kicker text-accent">
              {episode.episodeNumber != null && <>EP {String(episode.episodeNumber).padStart(2, "0")}</>}
              {episode.publishedAt && <span className="text-muted"> · {formatDate(episode.publishedAt)}</span>}
              {episode.duration && <span className="text-muted"> · {episode.duration}</span>}
            </p>
            <h1 className="headline-display text-3xl md:text-5xl mt-2 leading-tight">{episode.title}</h1>
          </header>
          {episode.coverImage && (
            <div className="aspect-[16/9] overflow-hidden bg-ink/[0.06] mb-6">
              <SmartImage image={episode.coverImage} className="w-full h-full" width={1200} />
            </div>
          )}
          <audio controls preload="none" src={episode.audioUrl} className="w-full">
            Your browser does not support the audio element.{" "}
            <a href={episode.audioUrl}>Download the episode</a>.
          </audio>
          {episode.description && <p className="article-body mt-6">{episode.description}</p>}
          {episode.guests && episode.guests.length > 0 && (
            <section className="mt-10 pt-8 border-t rule-soft">
              <p className="kicker text-muted mb-4">GUESTS</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {episode.guests.map((g) => (
                  <Link key={g._id} to={`/author/${g.slug}`} className="flex gap-3 items-center hover:opacity-80">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
                      <SmartImage image={g.image} className="w-full h-full" width={120} />
                    </div>
                    <p className="headline text-sm">{g.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
