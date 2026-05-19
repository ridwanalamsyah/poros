// Generate sitemap.xml and rss.xml at build time from mock data (or Sanity if configured).
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "dist");

if (!existsSync(out)) mkdirSync(out, { recursive: true });

const env = readEnv();
const site = env.VITE_SITE_URL || "https://porosmagazine.id";

function readEnv() {
  try {
    const txt = readFileSync(resolve(root, ".env.production"), "utf8");
    return Object.fromEntries(
      txt.split("\n").filter(Boolean).filter((l) => !l.startsWith("#")).map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
    );
  } catch {
    return {};
  }
}

async function loadArticles() {
  if (env.VITE_SANITY_PROJECT_ID) {
    const projectId = env.VITE_SANITY_PROJECT_ID;
    const dataset = env.VITE_SANITY_DATASET || "production";
    const apiVersion = env.VITE_SANITY_API_VERSION || "2024-10-01";
    const query = encodeURIComponent(
      `*[_type=="article" && defined(slug.current)]|order(publishedAt desc){title,"slug":slug.current,publishedAt,excerpt,"category":category->{title,"slug":slug.current}}`
    );
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return data.result ?? [];
    } catch (e) {
      console.warn("[generate-static] sanity fetch failed, falling back to mock:", e);
    }
  }
  // Fallback: import mock by path manipulation.
  const mockUrl = new URL("../src/data/mock.ts", import.meta.url);
  const src = readFileSync(mockUrl, "utf8");
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]).filter((s, i, arr) => arr.indexOf(s) === i);
  return slugs.map((slug) => ({ slug, title: slug, publishedAt: "2026-01-01", category: { slug: "labor" } }));
}

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;","\"":"&quot;"}[c]));
}

const articles = await loadArticles();

const urls = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/editions", changefreq: "weekly", priority: "0.8" },
  { loc: "/notes", changefreq: "weekly", priority: "0.7" },
  { loc: "/shop", changefreq: "weekly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  ...articles.map((a) => ({ loc: `/article/${a.slug}`, lastmod: a.publishedAt, changefreq: "monthly", priority: "0.9" })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>
    <loc>${site}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;
writeFileSync(resolve(out, "sitemap.xml"), sitemap);

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>POROS</title>
  <link>${site}</link>
  <description>POROS — majalah online dari Bandung. Labor · society · culture.</description>
  <language>id-ID</language>
  <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
  ${articles
    .map((a) => `<item>
    <title>${xmlEscape(a.title)}</title>
    <link>${site}/article/${a.slug}</link>
    <guid isPermaLink="true">${site}/article/${a.slug}</guid>
    ${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ""}
    ${a.excerpt ? `<description>${xmlEscape(a.excerpt)}</description>` : ""}
    ${a.category?.slug ? `<category>${xmlEscape(a.category.slug)}</category>` : ""}
  </item>`)
    .join("\n  ")}
</channel>
</rss>
`;
writeFileSync(resolve(out, "rss.xml"), rss);

console.log(`[generate-static] wrote sitemap.xml + rss.xml (${urls.length} urls, ${articles.length} articles)`);
