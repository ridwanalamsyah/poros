import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticles, getEditions, getNotes, getProducts, getSettings } from "../data/api";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleListSkeleton, HeroSkeleton } from "../components/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { formatDate, formatIDR } from "../utils/text";
import type { Article, HomepageSection, HomepageSectionKind, Note, Edition, Product } from "../types";

type Tab = "latest" | "commented";
const PAGE_SIZE = 6;

const DEFAULT_LAYOUT: HomepageSection[] = [
  { kind: "hero", enabled: true },
  { kind: "editors", enabled: true },
  { kind: "edition", enabled: true },
  { kind: "feed", enabled: true },
];

const DEFAULT_TITLES: Record<HomepageSectionKind, string> = {
  hero: "",
  editors: "FROM THE EDITORS",
  edition: "CURRENT EDITION",
  notes: "FROM THE NOTEBOOK",
  popular: "MOST POPULAR",
  feed: "ALL ARTICLES",
  shop: "FROM THE SHOP",
};

function commentsOf(a: Article) {
  return Math.max(0, Math.round((a.views ?? 0) / 110));
}

function sectionTitle(s: HomepageSection): string {
  return s.title?.trim() ? s.title.trim() : DEFAULT_TITLES[s.kind];
}

export function Home() {
  const { data: articles, loading } = useAsync(() => getArticles(40), []);
  const { data: editions } = useAsync(() => getEditions(), []);
  const { data: notes } = useAsync(() => getNotes(), []);
  const { data: products } = useAsync(() => getProducts(), []);
  const { data: settings } = useAsync(() => getSettings(), []);

  const all = useMemo<Article[]>(() => articles ?? [], [articles]);

  const layout = useMemo<HomepageSection[]>(() => {
    const fromSettings = settings?.homepageLayout?.sections;
    const list = fromSettings && fromSettings.length > 0 ? fromSettings : DEFAULT_LAYOUT;
    return list.filter((s) => s.enabled !== false && s.kind);
  }, [settings]);

  const pinnedHero = useMemo<Article | undefined>(() => {
    const slug = settings?.homepageLayout?.heroArticleSlug;
    if (!slug) return undefined;
    return all.find((a) => a.slug === slug);
  }, [all, settings]);

  const hero = pinnedHero ?? all[0];
  const heroIndex = hero ? all.findIndex((a) => a._id === hero._id) : -1;
  const rest = useMemo<Article[]>(
    () => (heroIndex >= 0 ? [...all.slice(0, heroIndex), ...all.slice(heroIndex + 1)] : all),
    [all, heroIndex],
  );

  return (
    <>
      <SEO />
      {loading && layout.some((s) => s.kind === "hero") ? (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-8">
          <HeroSkeleton />
        </section>
      ) : null}

      {!loading &&
        layout.map((section, i) => (
          <SectionRenderer
            key={section._key ?? `${section.kind}-${i}`}
            section={section}
            hero={hero}
            articles={rest}
            allArticles={all}
            editions={editions ?? []}
            notes={notes ?? []}
            products={products ?? []}
            loading={loading}
          />
        ))}
    </>
  );
}

type SectionProps = {
  section: HomepageSection;
  hero: Article | undefined;
  articles: Article[];
  allArticles: Article[];
  editions: Edition[];
  notes: Note[];
  products: Product[];
  loading: boolean;
};

function SectionRenderer(props: SectionProps) {
  switch (props.section.kind) {
    case "hero":
      return <HeroSection {...props} />;
    case "editors":
      return <EditorsSection {...props} />;
    case "edition":
      return <EditionSection {...props} />;
    case "notes":
      return <NotesSection {...props} />;
    case "popular":
      return <PopularSection {...props} />;
    case "feed":
      return <FeedSection {...props} />;
    case "shop":
      return <ShopSection {...props} />;
    default:
      return null;
  }
}

function HeroSection({ hero }: SectionProps) {
  if (!hero) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-8">
      <ArticleCard article={hero} variant="hero" />
    </section>
  );
}

function EditorsSection({ section, articles }: SectionProps) {
  const picks = useMemo(() => {
    const editorsPick = articles.filter((a) => a.editorsPick);
    return (editorsPick.length > 0 ? editorsPick : articles).slice(0, 3);
  }, [articles]);
  if (picks.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
      <div className="border-b rule-soft pb-2 mb-6">
        <h3 className="kicker text-accent">{sectionTitle(section)}</h3>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {picks.map((a) => (
          <ArticleCard key={a._id} article={a} variant="feature" />
        ))}
      </div>
    </section>
  );
}

function EditionSection({ section, editions }: SectionProps) {
  if (editions.length === 0) return null;
  const e = editions[0];
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
      <div className="border-l-2 border-accent pl-4 md:pl-6">
        <p className="kicker text-accent">
          {sectionTitle(section)} · ISSUE {e.issueNumber}
        </p>
        <Link to={`/edition/${e.slug}`} className="block group">
          <h3 className="headline-display text-3xl md:text-5xl mt-2 group-hover:opacity-80 leading-[1.05]">
            {e.title}
          </h3>
          {e.description && <p className="text-muted mt-3 max-w-2xl">{e.description}</p>}
        </Link>
        <div className="mt-3">
          <Link to="/editions" className="kicker hover-underline text-muted">
            VIEW ALL EDITIONS →
          </Link>
        </div>
      </div>
    </section>
  );
}

function NotesSection({ section, notes }: SectionProps) {
  const list = notes.slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
      <div className="border-b rule-soft pb-2 mb-6 flex items-end justify-between">
        <h3 className="kicker text-accent">{sectionTitle(section)}</h3>
        <Link to="/notes" className="kicker hover-underline text-muted">
          ALL NOTES →
        </Link>
      </div>
      <ul className="grid md:grid-cols-2 gap-6 md:gap-8">
        {list.map((n) => (
          <li key={n._id} className="border rule-soft p-5">
            <div className="byline mb-2">
              {n.author && <span>{n.author.name} · </span>}
              <span>{formatDate(n.publishedAt)}</span>
            </div>
            <p className="leading-relaxed">{n.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PopularSection({ section, allArticles }: SectionProps) {
  const popular = useMemo<Article[]>(
    () => [...allArticles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    [allArticles],
  );
  if (popular.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
      <div className="border-b rule-soft pb-2 mb-6">
        <h3 className="kicker text-accent">{sectionTitle(section)}</h3>
      </div>
      <ol className="grid md:grid-cols-2 gap-x-10 gap-y-5">
        {popular.map((a, i) => (
          <li key={a._id} className="flex items-start gap-3">
            <span
              className="font-logo text-accent text-3xl leading-none shrink-0"
              style={{ fontFamily: "Pirata One, serif" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${a.slug}`} className="headline-display text-lg leading-snug hover-underline block">
                {a.title}
              </Link>
              <p className="text-[0.72rem] text-muted mt-1">{(a.views ?? 0).toLocaleString()} Views</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FeedSection({ section, articles, allArticles, loading }: SectionProps) {
  const [tab, setTab] = useState<Tab>("latest");
  const [shown, setShown] = useState(PAGE_SIZE);

  const sorted = useMemo<Article[]>(() => {
    if (tab === "commented") {
      return [...articles].sort((a, b) => commentsOf(b) - commentsOf(a));
    }
    return [...articles].sort(
      (a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0),
    );
  }, [articles, tab]);

  const popular = useMemo<Article[]>(
    () => [...allArticles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    [allArticles],
  );

  const feed = sorted.slice(0, shown);
  const canLoadMore = sorted.length > shown;

  if (loading) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-12 md:pt-16">
        <ArticleListSkeleton />
      </section>
    );
  }
  if (sorted.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-12 md:pt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="border-b rule pb-3 flex items-end gap-6">
            {(["latest", "commented"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setShown(PAGE_SIZE);
                }}
                className={`kicker tracking-[0.18em] pb-1 transition-opacity ${tab === t ? "opacity-100 border-b-2 border-ink -mb-[13px]" : "opacity-50 hover:opacity-80"}`}
              >
                {t === "latest" ? section.title?.trim() || "LATEST" : "COMMENTED"}
              </button>
            ))}
          </div>

          <div className="pt-3">
            {feed.map((a) => (
              <ArticleCard key={a._id} article={a} variant="row" />
            ))}
            {canLoadMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setShown((n) => n + PAGE_SIZE)}
                  className="kicker tracking-[0.2em] border border-ink/80 dark:border-paper/60 px-7 py-3 hover:bg-ink hover:text-paper transition-colors"
                >
                  LOAD MORE
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="md:col-span-1 md:border-l rule-soft md:pl-10">
          <h3 className="kicker text-accent border-b rule-soft pb-2 mb-5">MOST POPULAR</h3>
          <ol className="space-y-5">
            {popular.map((a, i) => (
              <li key={a._id} className="flex items-start gap-3">
                <span
                  className="font-logo text-accent text-2xl leading-none shrink-0"
                  style={{ fontFamily: "Pirata One, serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/article/${a.slug}`}
                    className="headline-display text-base leading-snug hover-underline block"
                  >
                    {a.title}
                  </Link>
                  <p className="text-[0.7rem] text-muted mt-1">
                    {(a.views ?? 0).toLocaleString()} Views
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-6 border-t rule-soft">
            <h3 className="kicker text-accent mb-3">FROM THE NOTEBOOK</h3>
            <p className="text-sm text-muted italic">
              Short notes from the Velvet Collapse editorial team — between editions.
            </p>
            <Link to="/notes" className="kicker mt-3 inline-block hover-underline">
              READ NOTES →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ShopSection({ section, products }: SectionProps) {
  const list = products.slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
      <div className="border-b rule-soft pb-2 mb-6 flex items-end justify-between">
        <h3 className="kicker text-accent">{sectionTitle(section)}</h3>
        <Link to="/shop" className="kicker hover-underline text-muted">
          ALL PRODUCTS →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {list.map((p) => (
          <Link key={p._id} to="/shop" className="block group">
            <div className="aspect-square bg-ink/[0.04] overflow-hidden mb-3">
              <SmartImage image={p.image} className="w-full h-full group-hover:scale-[1.02] transition-transform" width={500} />
            </div>
            <p className="headline-display text-base leading-snug group-hover:opacity-80">{p.title}</p>
            <p className="kicker text-muted mt-1">{formatIDR(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
