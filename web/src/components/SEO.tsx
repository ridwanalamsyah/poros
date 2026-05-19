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

const SITE = "POROS";
const DEFAULT_DESC = "POROS — majalah online dari Bandung. Labor · society · culture.";

export function SEO({ title, description, image, imageUrl: customImageUrl, type = "website", publishedAt, author }: Props) {
  const t = title ? `${title} — ${SITE}` : `${SITE} — labor · society · culture`;
  const d = description ?? DEFAULT_DESC;
  const og = customImageUrl ?? (image ? imageUrl(image, 1200) : undefined) ?? "/og-default.png";
  return (
    <Helmet prioritizeSeoTags>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content={SITE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={og} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {author && <meta property="article:author" content={author} />}
    </Helmet>
  );
}
