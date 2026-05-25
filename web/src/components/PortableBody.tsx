import { useState } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { SmartImage } from "./SmartImage";
import { Lightbox } from "./Lightbox";
import { imageUrl } from "../sanity";
import type { PortableTextBlock, SanityImage } from "../types";

type ImageValue = SanityImage & { caption?: string };
type PullQuoteValue = { text: string; attribution?: string };
type CalloutValue = { text: string; tone?: "info" | "warn" | "accent" };
type EmbedValue = { url: string };

function ZoomableFigure({ value }: { value: ImageValue }) {
  const [open, setOpen] = useState(false);
  const full = imageUrl(value, 1800);
  return (
    <>
      <figure>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in p-0 border-0 bg-transparent"
          aria-label="Buka gambar penuh"
        >
          <SmartImage image={value} width={1400} className="aspect-[16/9]" />
        </button>
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
      {open && full && <Lightbox src={full} alt={value.caption ?? ""} onClose={() => setOpen(false)} />}
    </>
  );
}

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="aspect-video my-6">
      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ImageValue }) => <ZoomableFigure value={value} />,
    pullQuote: ({ value }: { value: PullQuoteValue }) => (
      <div className="pullquote">
        <p>“{value.text}”</p>
        {value.attribution && <p className="byline mt-2">— {value.attribution}</p>}
      </div>
    ),
    callout: ({ value }: { value: CalloutValue }) => (
      <aside className="callout"><p>{value.text}</p></aside>
    ),
    divider: () => <hr />,
    embed: ({ value }: { value: EmbedValue }) => {
      const yt = value.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (yt) return <YouTubeEmbed id={yt[1]} />;
      if (value.url.includes("spotify.com")) return <SpotifyEmbed url={value.url} />;
      return (
        <p className="my-4"><a className="underline" href={value.url} target="_blank" rel="noreferrer">{value.url}</a></p>
      );
    },
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href ?? "#"} target={value?.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>
    ),
    footnote: ({ value, children }: { value?: { text?: string }; children: React.ReactNode }) => (
      <span className="footnote-mark" title={value?.text ?? ""}>
        {children}
        <sup className="footnote-sup">*</sup>
      </span>
    ),
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
};

export function PortableBody({ blocks }: { blocks: PortableTextBlock[] }) {
  return (
    <div className="article-body">
      <PortableText value={blocks} components={components} />
    </div>
  );
}
