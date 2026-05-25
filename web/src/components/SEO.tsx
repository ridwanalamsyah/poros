import { Helmet } from "react-helmet-async";
import { imageUrl } from "../sanity";
import type { SanityImage } from "../types";

type Breadcrumb = { name: string; url: string };

type Props = {
  title?: string;
  description?: string;
  image?: SanityImage;
  imageUrl?: string;
  type?: "website" | "article";
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  authorUrl?: string;
  url?: string;
  breadcrumbs?: Breadcrumb[];
};

const SITE = "Velvet Collapse Magazine";
const DEFAULT_DESC = "Velvet Collapse Magazine — built from the mess. Majalah online dari Bandung.";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

function absUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function SEO({
  title,
  description,
  image,
  imageUrl: customImageUrl,
  type = "website",
  publishedAt,
  modifiedAt,
  author,
  authorUrl,
  url,
  breadcrumbs,
}: Props) {
  const t = title ? `${title} — ${SITE}` : `${SITE} — Built from the mess`;
  const d = description ?? DEFAULT_DESC;
  const og = customImageUrl ?? (image ? imageUrl(image, 1200) : undefined) ?? "/og-default.png";
  const canonical = absUrl(url) ?? (typeof window !== "undefined" ? window.location.href : undefined);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE,
    url: SITE_URL || undefined,
    logo: absUrl("/og-default.png"),
    sameAs: ["https://instagram.com/", "https://x.com/", "https://facebook.com/"],
  };

  const articleLd =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: d,
          image: absUrl(og),
          datePublished: publishedAt,
          dateModified: modifiedAt ?? publishedAt,
          author: author
            ? {
                "@type": "Person",
                name: author,
                url: absUrl(authorUrl),
              }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: SITE,
            logo: { "@type": "ImageObject", url: absUrl("/og-default.png") },
          },
          mainEntityOfPage: canonical,
        }
      : null;

  const breadcrumbLd =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: b.name,
            item: absUrl(b.url),
          })),
        }
      : null;

  return (
    <Helmet prioritizeSeoTags>
      <title>{t}</title>
      <meta name="description" content={d} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content={SITE} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={og} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
      {author && <meta property="article:author" content={author} />}
      <script type="application/ld+json">
        {JSON.stringify(organizationLd, (_k, v) => (v === undefined ? undefined : v))}
      </script>
      {articleLd && (
        <script type="application/ld+json">
          {JSON.stringify(articleLd, (_k, v) => (v === undefined ? undefined : v))}
        </script>
      )}
      {breadcrumbLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbLd, (_k, v) => (v === undefined ? undefined : v))}
        </script>
      )}
    </Helmet>
  );
}
