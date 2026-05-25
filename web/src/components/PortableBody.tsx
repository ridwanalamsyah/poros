import { useMemo, useState } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { SmartImage } from "./SmartImage";
import { Lightbox } from "./Lightbox";
import type { PortableTextBlock, SanityImage } from "../types";

type ImageValue = SanityImage & { caption?: string };
type PullQuoteValue = { text: string; attribution?: string };
type CalloutValue = { text: string; tone?: "info" | "warn" | "accent" };
type EmbedValue = { url: string };

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="aspect-video my-6">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function SpotifyEmbed({ url }: { url: string }) {
  const m = url.match(/spotify\.com\/(episode|track|show|playlist|album)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  const src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
  return (
    <div className="my-6">
      <iframe className="w-full" height="232" src={src} title="Spotify" allow="encrypted-media" />
    </div>
  );
}

type FootnoteEntry = { id: string; text: string; index: number };

function collectFootnotes(blocks: PortableTextBlock[]): FootnoteEntry[] {
  const out: FootnoteEntry[] = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const markDefs = (block as unknown as { markDefs?: Array<{ _key: string; _type: string; text?: string }> }).markDefs ?? [];
    const children = (block as unknown as { children?: Array<{ marks?: string[] }> }).children ?? [];
    const usedKeys = new Set<string>();
    for (const child of children) {
      for (const m of child.marks ?? []) {
        const def = markDefs.find((d) => d._key === m);
        if (def && def._type === "footnote" && !usedKeys.has(def._key)) {
          usedKeys.add(def._key);
          out.push({ id: def._key, text: def.text ?? "", index: out.length + 1 });
        }
      }
    }
  }
  return out;
}

export function PortableBody({ blocks }: { blocks: PortableTextBlock[] }) {
  const [lightbox, setLightbox] = useState<{ image: SanityImage; caption?: string } | null>(null);

  const footnotes = useMemo(() => collectFootnotes(blocks), [blocks]);
  const footnoteIndex = useMemo(() => {
    const map = new Map<string, number>();
    footnotes.forEach((f) => map.set(f.id, f.index));
    return map;
  }, [footnotes]);

  const components: PortableTextComponents = useMemo(
    () => ({
      types: {
        image: ({ value }: { value: ImageValue }) => (
          <figure>
            <button
              type="button"
              onClick={() => setLightbox({ image: value, caption: value.caption })}
              className="block w-full cursor-zoom-in group"
              aria-label="View full image"
            >
              <SmartImage
                image={value}
                width={1400}
                className="aspect-[16/9] transition-opacity group-hover:opacity-95"
              />
            </button>
            {value.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        ),
        pullQuote: ({ value }: { value: PullQuoteValue }) => (
          <div className="pullquote">
            <p>&ldquo;{value.text}&rdquo;</p>
            {value.attribution && <p className="byline mt-2">— {value.attribution}</p>}
          </div>
        ),
        callout: ({ value }: { value: CalloutValue }) => (
          <aside className="callout">
            <p>{value.text}</p>
          </aside>
        ),
        divider: () => <hr />,
        embed: ({ value }: { value: EmbedValue }) => {
          const yt = value.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
          if (yt) return <YouTubeEmbed id={yt[1]} />;
          if (value.url.includes("spotify.com")) return <SpotifyEmbed url={value.url} />;
          return (
            <p className="my-4">
              <a className="underline" href={value.url} target="_blank" rel="noreferrer">
                {value.url}
              </a>
            </p>
          );
        },
      },
      marks: {
        link: ({ value, children }) => (
          <a
            href={value?.href ?? "#"}
            target={value?.href?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        footnote: ({ value, children }) => {
          const key = (value as { _key?: string })?._key;
          const idx = key ? footnoteIndex.get(key) : undefined;
          if (!idx) return <>{children}</>;
          return (
            <>
              {children}
              <sup id={`fnref-${idx}`} className="footnote-ref">
                <a href={`#fn-${idx}`} aria-label={`See footnote ${idx}`}>
                  [{idx}]
                </a>
              </sup>
            </>
          );
        },
        marginNote: ({ value, children }) => {
          const text = (value as { text?: string })?.text ?? "";
          if (!text) return <>{children}</>;
          return (
            <span className="margin-note-wrap">
              <span className="margin-note-anchor">{children}</span>
              <aside className="margin-note">{text}</aside>
            </span>
          );
        },
      },
      block: {
        h2: ({ children }) => <h2>{children}</h2>,
        h3: ({ children }) => <h3>{children}</h3>,
        blockquote: ({ children }) => <blockquote>{children}</blockquote>,
        normal: ({ children }) => <p>{children}</p>,
      },
    }),
    [footnoteIndex],
  );

  return (
    <>
      <div className="article-body">
        <PortableText value={blocks} components={components} />
        {footnotes.length > 0 && (
          <section className="footnotes mt-12 pt-6 border-t rule-soft">
            <h3 className="kicker text-accent mb-4">FOOTNOTES</h3>
            <ol>
              {footnotes.map((f) => (
                <li key={f.id} id={`fn-${f.index}`}>
                  <span>{f.text}</span>{" "}
                  <a href={`#fnref-${f.index}`} aria-label="Back to text" className="footnote-back">
                    ↩
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
      {lightbox && (
        <Lightbox
          image={lightbox.image}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
