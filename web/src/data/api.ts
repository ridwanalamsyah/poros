import { sanity, sanityEnabled } from "../sanity";
import type { Article, Author, Category, Edition, Note, Product, Settings } from "../types";
import { mockArticles, mockAuthors, mockCategories, mockEditions, mockNotes, mockProducts, mockSettings } from "./mock";

const articleFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  coverImage{..., asset->{..., metadata{lqip, dimensions}}},
  "category": category->{_id, title, "slug": slug.current, description, sortOrder},
  "author": author->{_id, name, "slug": slug.current, bio, image{..., asset->{..., metadata{lqip}}}, twitter, instagram, website},
  "authors": authors[]->{_id, name, "slug": slug.current, image{..., asset->{..., metadata{lqip}}}},
  "edition": edition->{_id, title, "slug": slug.current, issueNumber, description},
  tags,
  publishedAt,
  editorsPick,
  views
`;

async function fetchOr<T>(q: string, params: Record<string, unknown> | undefined, fallback: T): Promise<T> {
  if (!sanityEnabled || !sanity) return fallback;
  try {
    const data = await sanity.fetch(q, params ?? {});
    if (data == null || (Array.isArray(data) && data.length === 0)) return fallback;
    return data as T;
  } catch (e) {
    console.warn("[sanity] fetch failed, using fallback:", e);
    return fallback;
  }
}

export function getCategories(): Promise<Category[]> {
  return fetchOr<Category[]>(
    `*[_type == "category"]|order(sortOrder asc, title asc){_id, title, "slug": slug.current, description, sortOrder, color}`,
    undefined,
    mockCategories,
  );
}

export function getCategory(slug: string): Promise<Category | null> {
  return fetchOr<Category | null>(
    `*[_type == "category" && slug.current == $slug][0]{_id, title, "slug": slug.current, description, sortOrder, color}`,
    { slug },
    mockCategories.find((c) => c.slug === slug) ?? null,
  );
}

export function getArticles(limit?: number): Promise<Article[]> {
  const range = typeof limit === "number" ? `[0...${limit}]` : "";
  return fetchOr<Article[]>(
    `*[_type == "article" && defined(slug.current)]|order(publishedAt desc, _createdAt desc)${range}{${articleFields}}`,
    undefined,
    typeof limit === "number" ? mockArticles.slice(0, limit) : mockArticles,
  );
}

export function getArticlesByCategory(slug: string): Promise<Article[]> {
  return fetchOr<Article[]>(
    `*[_type == "article" && category->slug.current == $slug]|order(publishedAt desc){${articleFields}}`,
    { slug },
    mockArticles.filter((a) => a.category?.slug === slug),
  );
}

export function getArticlesByTag(tag: string): Promise<Article[]> {
  return fetchOr<Article[]>(
    `*[_type == "article" && $tag in tags]|order(publishedAt desc){${articleFields}}`,
    { tag },
    mockArticles.filter((a) => a.tags?.includes(tag)),
  );
}

export function getArticlesByAuthor(slug: string): Promise<Article[]> {
  return fetchOr<Article[]>(
    `*[_type == "article" && (author->slug.current == $slug || $slug in authors[]->slug.current)]|order(publishedAt desc){${articleFields}}`,
    { slug },
    mockArticles.filter((a) => a.author?.slug === slug || a.authors?.some((au) => au.slug === slug)),
  );
}

export function getArticlesByEdition(slug: string): Promise<Article[]> {
  return fetchOr<Article[]>(
    `*[_type == "article" && edition->slug.current == $slug]|order(publishedAt desc){${articleFields}}`,
    { slug },
    mockArticles.filter((a) => a.edition?.slug === slug),
  );
}

export function getArticle(slug: string): Promise<Article | null> {
  return fetchOr<Article | null>(
    `*[_type == "article" && slug.current == $slug][0]{${articleFields}}`,
    { slug },
    mockArticles.find((a) => a.slug === slug) ?? null,
  );
}

export function getAuthor(slug: string): Promise<Author | null> {
  return fetchOr<Author | null>(
    `*[_type == "author" && slug.current == $slug][0]{_id, name, "slug": slug.current, bio, image{..., asset->{..., metadata{lqip}}}, twitter, instagram, website}`,
    { slug },
    mockAuthors.find((a) => a.slug === slug) ?? null,
  );
}

export function getAuthors(): Promise<Author[]> {
  return fetchOr<Author[]>(
    `*[_type == "author"]|order(name asc){_id, name, "slug": slug.current, bio, image{..., asset->{..., metadata{lqip}}}}`,
    undefined,
    mockAuthors,
  );
}

export function getEditions(): Promise<Edition[]> {
  return fetchOr<Edition[]>(
    `*[_type == "edition"]|order(publishedAt desc){_id, title, "slug": slug.current, issueNumber, description, coverImage{..., asset->{..., metadata{lqip}}}, publishedAt}`,
    undefined,
    mockEditions,
  );
}

export function getEdition(slug: string): Promise<Edition | null> {
  return fetchOr<Edition | null>(
    `*[_type == "edition" && slug.current == $slug][0]{_id, title, "slug": slug.current, issueNumber, description, coverImage{..., asset->{..., metadata{lqip}}}, publishedAt}`,
    { slug },
    mockEditions.find((e) => e.slug === slug) ?? null,
  );
}

export function getNotes(): Promise<Note[]> {
  return fetchOr<Note[]>(
    `*[_type == "note"]|order(publishedAt desc){_id, body, "author": author->{_id, name, "slug": slug.current, image{..., asset->{..., metadata{lqip}}}}, publishedAt}`,
    undefined,
    mockNotes,
  );
}

export function getProducts(): Promise<Product[]> {
  return fetchOr<Product[]>(
    `*[_type == "product"]|order(_createdAt asc){_id, title, "slug": slug.current, description, price, image{..., asset->{..., metadata{lqip}}}, inStock}`,
    undefined,
    mockProducts,
  );
}

export function getSettings(): Promise<Settings> {
  return fetchOr<Settings>(
    `*[_type == "settings"][0]{siteTitle, siteDescription, tipJarSaweria, tipJarTrakteer, tipJarPatreon, cusdisAppId, newsletterEndpoint}`,
    undefined,
    mockSettings,
  );
}

export function getAllTags(): Promise<{ tag: string; count: number }[]> {
  if (!sanityEnabled || !sanity) {
    const tagMap = new Map<string, number>();
    mockArticles.forEach((a) => a.tags?.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1)));
    return Promise.resolve([...tagMap.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count));
  }
  return fetchOr<{ tag: string; count: number }[]>(
    `array::unique(*[_type == "article" && defined(tags)].tags[]) | order(@ asc)`,
    undefined,
    [],
  ).then((tags) => (tags as unknown as string[]).map((tag) => ({ tag, count: 0 })));
}
