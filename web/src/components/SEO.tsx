import { Helmet } from "react-helmet-async";
import { imageUrl } from "../sanity";
import type { SanityImage } from "../types";

type Props = {
  title?: string;
  description?: string;
  image?: SanityImage;
  imageUrl?: string;
  type?: "website" | "article";
  publishedAt?: string;
  author?: string;
};

const SITE = "Velvet Collapse Magazine";
const DEFAULT_DESC = "Velvet Collapse Magazine — built from the mess. Majalah online dari Bandung.";

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://velvetcollapse.id";
}

export function SEO({ title, description, image, imageUrl: customImageUrl, type = "website", publishedAt, author }: Props) {
  const t = title ? `${title} — ${SITE}` : `${SITE} — Built from the mess`;
  const d = description ?? DEFAULT_DESC;
  const og = customImageUrl ?? (image ? imageUrl(image, 1200) : undefined) ?? "/og-default.png";
  const url = typeof window !== "undefined" ? window.location.href : siteOrigin();

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE,
    url: siteOrigin(),
    logo: `${siteOrigin()}/og-default.png`,
  };

  const articleLd = type === "article" ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: d,
    image: og,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: author ? { "@type": "Person", name: author } : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE,
      logo: { "@type": "ImageObject", url: `${siteOrigin()}/og-default.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  } : null;

  return (
    <Helmet prioritizeSeoTags>
      <title>{t}</title>
      <meta name="description" content={d} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={og} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={og} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {author && <meta property="article:author" content={author} />}
      <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      {articleLd && <script type="application/ld+json">{JSON.stringify(articleLd)}</script>}
    </Helmet>
  );
}
