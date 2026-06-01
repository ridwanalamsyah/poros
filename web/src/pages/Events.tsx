import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getEvent, getEvents } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import type { VelvetEvent } from "../types";

function eventDate(iso: string, locale = "id-ID"): { day: string; month: string; full: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "", month: "", full: "", time: "" };
  return {
    day: d.toLocaleDateString(locale, { day: "2-digit" }),
    month: d.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
    full: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
  };
}

function EventRow({ ev, past = false }: { ev: VelvetEvent; past?: boolean }) {
  const d = eventDate(ev.startAt);
  return (
    <li className={past ? "opacity-60" : ""}>
      <Link to={`/events/${ev.slug}`} className="group grid grid-cols-[64px_1fr] gap-4 sm:gap-6 items-start py-5">
        <div className="text-center border rule-soft py-2">
          <div className="headline-display text-2xl leading-none">{d.day}</div>
          <div className="stat text-accent mt-1">{d.month}</div>
        </div>
        <div>
          <h3 className="headline-display text-xl sm:text-2xl leading-tight group-hover:opacity-80">{ev.title}</h3>
          <p className="byline mt-1">
            {d.time}{ev.venue && <> · {ev.venue}</>}{ev.city && <>, {ev.city}</>}
            {ev.free && <span className="text-accent"> · FREE</span>}
          </p>
          {ev.description && <p className="text-muted mt-2 line-clamp-2 max-w-2xl">{ev.description}</p>}
        </div>
      </Link>
    </li>
  );
}

export function EventsPage() {
  const { data: events } = useAsync(() => getEvents(), []);
  const now = Date.now();
  const upcoming = (events ?? []).filter((e) => new Date(e.startAt).getTime() >= now);
  const past = (events ?? []).filter((e) => new Date(e.startAt).getTime() < now).reverse();

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Events" description="Velvet Collapse events — launches, live music, and workshops in Bandung." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">EVENTS</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">What's on.</h1>
        <p className="text-muted mt-3 max-w-2xl">Launches, live music, and workshops — mostly in Bandung.</p>
      </header>

      {upcoming.length > 0 && (
        <section>
          <p className="kicker text-muted mb-2">UPCOMING</p>
          <ul className="divide-y rule-soft">
            {upcoming.map((e) => <EventRow key={e._id} ev={e} />)}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-12">
          <p className="kicker text-muted mb-2">PAST</p>
          <ul className="divide-y rule-soft">
            {past.map((e) => <EventRow key={e._id} ev={e} past />)}
          </ul>
        </section>
      )}

      {events && upcoming.length === 0 && past.length === 0 && (
        <p className="text-muted">No events scheduled right now. Check back soon.</p>
      )}
    </div>
  );
}

export function EventPage() {
  const { slug = "" } = useParams();
  const { data: ev, loading } = useAsync(() => getEvent(slug), [slug]);

  if (!ev && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="headline-display text-4xl">Event not found.</h1>
        <Link to="/events" className="kicker mt-6 inline-block hover-underline">← Back to events</Link>
      </div>
    );
  }

  const start = ev ? eventDate(ev.startAt) : null;
  const end = ev?.endAt ? eventDate(ev.endAt) : null;
  const isPast = ev ? new Date(ev.startAt).getTime() < Date.now() : false;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title={ev?.title} description={ev?.description} image={ev?.coverImage} />
      {ev && start && (
        <>
          <Link to="/events" className="kicker text-muted hover-underline">← EVENTS</Link>
          <header className="mt-4 border-b rule-soft pb-8 mb-8">
            <p className="kicker text-accent">{isPast ? "PAST EVENT" : "UPCOMING"}</p>
            <h1 className="headline-display text-3xl md:text-5xl mt-2 leading-tight">{ev.title}</h1>
            <p className="mt-4 leading-relaxed">
              <span className="font-medium">{start.full}</span>
              <br />
              {start.time}{end ? `–${end.time}` : ""}{ev.venue && ` · ${ev.venue}`}{ev.city && `, ${ev.city}`}
              {ev.free && <span className="text-accent"> · FREE</span>}
            </p>
          </header>
          {ev.coverImage && (
            <div className="aspect-[16/9] overflow-hidden bg-ink/[0.06] mb-6">
              <SmartImage image={ev.coverImage} className="w-full h-full" width={1200} />
            </div>
          )}
          {ev.description && <p className="article-body">{ev.description}</p>}
          {ev.ticketUrl && !isPast && (
            <a href={ev.ticketUrl} target="_blank" rel="noopener noreferrer" className="section-rule bg-ink text-paper px-5 py-3 kicker inline-block mt-8 hover:opacity-90">
              {ev.free ? "RSVP →" : "GET TICKETS →"}
            </a>
          )}
        </>
      )}
    </div>
  );
}
