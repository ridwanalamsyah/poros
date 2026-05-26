// Generate sitemap.xml, rss.xml, and per-article OG HTML stubs at build time
// from mock data (or Sanity if VITE_SANITY_PROJECT_ID is set). Article stubs
// inject meta tags so WhatsApp / Facebook / Twitter scrapers (which don't
// execute client JS) still see proper preview cards before hydration.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "dist");

if (!existsSync(out)) mkdirSync(out, { recursive: true });

const env = readEnv();
const site = env.VITE_SITE_URL || "https://velvet-collapse-magazine.vercel.app";

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
      `*[_type=="article" && defined(slug.current)]|order(publishedAt desc){title,"slug":slug.current,publishedAt,excerpt,"cover":coverImage.asset->url,"category":category->{title,"slug":slug.current},"author":author->{name}}`
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
  // Fallback: parse the mock file so build still produces sitemap + OG stubs
  // even when no Sanity env is configured.
  const mockUrl = new URL("../src/data/mock.ts", import.meta.url);
  const src = readFileSync(mockUrl, "utf8");
  const blocks = src.match(/\{\s*_id:[^}]*?\}/gs) ?? [];
  const arts = [];
  for (const b of blocks) {
    if (!b.includes("body:")) continue;
    const slugM = b.match(/slug:\s*"([^"]+)"/);
    const titleM = b.match(/title:\s*"([^"]+)"/);
    const excM = b.match(/excerpt:\s*"([^"]+)"/);
    const dateM = b.match(/publishedAt:\s*"([^"]+)"/);
    const coverM = b.match(/_placeholderUrl:\s*"([^"]+)"/);
    if (slugM && titleM) {
      arts.push({
        slug: slugM[1],
        title: titleM[1],
        excerpt: excM?.[1],
        publishedAt: dateM?.[1] ?? "2026-01-01",
        cover: coverM?.[1],
      });
    }
  }
  return arts;
}

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;","\"":"&quot;"}[c]));
}

function htmlEscape(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#39;"}[c]));
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
  <title>Velvet Collapse Magazine</title>
  <link>${site}</link>
  <description>Velvet Collapse Magazine — built from the mess. Majalah online dari Bandung.</description>
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

// ---- robots.txt with absolute sitemap URL ----
const robots = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;
writeFileSync(resolve(out, "robots.txt"), robots);

// ---- per-article OG HTML stubs ----
// Patches dist/index.html into dist/article/{slug}/index.html with per-article
// <title> + og:* meta tags so non-JS scrapers (WhatsApp / FB / Twitter card
// validator) see proper preview cards.
const indexPath = resolve(out, "index.html");
let indexHtml = "";
try {
  indexHtml = readFileSync(indexPath, "utf8");
} catch {
  console.warn("[generate-static] dist/index.html not found, skipping per-article OG stubs");
}

if (indexHtml) {
  const META_RE = /<meta\s+(?:name|property)=["'](?:description|og:title|og:description|og:image|og:type|og:url|twitter:title|twitter:description|twitter:image|article:published_time|article:author)["'][^>]*>\s*/g;
  const TITLE_RE = /<title>[^<]*<\/title>/;
  let wrote = 0;
  for (const a of articles) {
    const dir = resolve(out, "article", a.slug);
    mkdirSync(dir, { recursive: true });
    const title = `${a.title} \u2014 Velvet Collapse Magazine`;
    const desc = a.excerpt ?? "Velvet Collapse Magazine \u2014 built from the mess. Majalah online dari Bandung.";
    const img = a.cover ?? `${site}/og-default.png`;
    const articleUrl = `${site}/article/${a.slug}`;
    const metaBlock = `<title>${htmlEscape(title)}</title>\n    <meta name="description" content="${htmlEscape(desc)}" />\n    <meta property="og:type" content="article" />\n    <meta property="og:url" content="${htmlEscape(articleUrl)}" />\n    <meta property="og:title" content="${htmlEscape(title)}" />\n    <meta property="og:description" content="${htmlEscape(desc)}" />\n    <meta property="og:image" content="${htmlEscape(img)}" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${htmlEscape(title)}" />\n    <meta name="twitter:description" content="${htmlEscape(desc)}" />\n    <meta name="twitter:image" content="${htmlEscape(img)}" />${a.publishedAt ? `\n    <meta property="article:published_time" content="${htmlEscape(a.publishedAt)}" />` : ""}${a.author?.name ? `\n    <meta property="article:author" content="${htmlEscape(a.author.name)}" />` : ""}`;
    const html = indexHtml.replace(META_RE, "").replace(TITLE_RE, metaBlock);
    writeFileSync(resolve(dir, "index.html"), html);
    wrote++;
  }
  console.log(`[generate-static] wrote ${wrote} per-article OG HTML stubs`);
}

console.log(`[generate-static] wrote sitemap.xml + rss.xml (${urls.length} urls, ${articles.length} articles)`);
