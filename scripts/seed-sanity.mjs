#!/usr/bin/env node
// Seed the Sanity dataset with a baseline editorial setup:
//   - 4 categories (LABOR, SOCIETY, CULTURE, MUSIC)
//   - 2 editors (Raditya, Ridwan)
//   - Edition 001
//   - 4 shop products with priced IDR
//   - Settings singleton with site title + tip jar URLs + default homepage layout
//
// Idempotent: documents use deterministic _id values, so re-running the script
// upserts instead of duplicating.
//
// Usage:
//   SANITY_PROJECT_ID=lyo17dt8 \
//   SANITY_DATASET=production \
//   SANITY_WRITE_TOKEN=sk-... \
//   node scripts/seed-sanity.mjs
//
// You can pass --dry-run to print the document set without writing. Dry-run
// does not need @sanity/client installed.
//
// For a real write, run from inside the web/ folder so @sanity/client resolves:
//   cd web && node ../scripts/seed-sanity.mjs

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

const projectId = process.env.SANITY_PROJECT_ID || "lyo17dt8";
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-10-01";
const token = process.env.SANITY_WRITE_TOKEN;

if (!dryRun && !token) {
  console.error(
    "SANITY_WRITE_TOKEN is required (or pass --dry-run to print without writing).",
  );
  process.exit(1);
}

const categories = [
  {
    _id: "seed-cat-labor",
    _type: "category",
    title: "LABOR",
    slug: { _type: "slug", current: "labor" },
    description:
      "Suara dari ruang kerja Bandung dan sekitarnya — buruh, pekerja platform, hingga organisasi serikat.",
    sortOrder: 10,
  },
  {
    _id: "seed-cat-society",
    _type: "category",
    title: "SOCIETY",
    slug: { _type: "slug", current: "society" },
    description:
      "Kondisi sosial Bandung dan kota-kota Jawa Barat — kebijakan, ruang publik, marjinalisasi.",
    sortOrder: 20,
  },
  {
    _id: "seed-cat-culture",
    _type: "category",
    title: "CULTURE",
    slug: { _type: "slug", current: "culture" },
    description:
      "Esai, kritik, dan reportase soal musik, film, sastra, dan ekspresi populer dari Bandung.",
    sortOrder: 30,
  },
  {
    _id: "seed-cat-music",
    _type: "category",
    title: "MUSIC",
    slug: { _type: "slug", current: "music" },
    description:
      "Kanal khusus untuk musik bawah tanah, ulasan rilisan, dan obrolan dengan band.",
    sortOrder: 40,
  },
];

const authors = [
  {
    _id: "seed-author-raditya",
    _type: "author",
    name: "Raditya Fitra",
    slug: { _type: "slug", current: "raditya-fitra" },
    bio:
      "Editor Velvet Collapse Magazine. Menulis tentang dunia kerja dan ekonomi platform dari Bandung.",
    twitter: "radityafitra",
  },
  {
    _id: "seed-author-ridwan",
    _type: "author",
    name: "Ridwan Alamsyah",
    slug: { _type: "slug", current: "ridwan-alamsyah" },
    bio:
      "Editor Velvet Collapse Magazine. Sebelumnya menulis kolom budaya dan musik bawah tanah.",
    twitter: "ridwanalamsyah",
  },
];

const editions = [
  {
    _id: "seed-edition-001",
    _type: "edition",
    issueNumber: "001",
    title: "Edisi 001 — Kota yang Berhenti Sopan",
    slug: { _type: "slug", current: "001-kota-yang-berhenti-sopan" },
    description:
      "Edisi perdana Velvet Collapse Magazine. Tentang Bandung yang sedang berdamai dengan dirinya sendiri.",
    publishedAt: "2026-03-01T00:00:00.000Z",
  },
];

const products = [
  {
    _id: "seed-product-edisi-001",
    _type: "product",
    title: "Velvet Collapse — Edisi 001",
    slug: { _type: "slug", current: "edisi-001" },
    description: "Cetakan terbatas. 96 halaman, kertas matte 100gsm.",
    price: 85000,
    inStock: true,
  },
  {
    _id: "seed-product-edisi-002",
    _type: "product",
    title: "Velvet Collapse — Edisi 002",
    slug: { _type: "slug", current: "edisi-002" },
    description: "Edisi tema pekerja platform. 104 halaman.",
    price: 85000,
    inStock: true,
  },
  {
    _id: "seed-product-tote",
    _type: "product",
    title: "Tote Bag Velvet Collapse",
    slug: { _type: "slug", current: "tote-bag" },
    description: "Kanvas 12 oz, sablon manual di Bandung.",
    price: 95000,
    inStock: true,
  },
  {
    _id: "seed-product-bundle",
    _type: "product",
    title: "Bundle Edisi 001 + 002",
    slug: { _type: "slug", current: "bundle-001-002" },
    description: "Hemat Rp 25.000. Termasuk ongkir Bandung Raya.",
    price: 145000,
    inStock: true,
  },
];

const settings = {
  _id: "settings",
  _type: "settings",
  siteTitle: "Velvet Collapse Magazine",
  siteDescription:
    "Velvet Collapse Magazine — built from the mess. Majalah online dari Bandung.",
  tipJarSaweria: "https://saweria.co/velvetcollapse",
  tipJarTrakteer: "https://trakteer.id/velvetcollapse",
  reactionLabels: ["Suka", "Penting", "Kena banget"],
  homepageLayout: {
    sections: [
      { _key: "hero", kind: "hero", enabled: true },
      { _key: "editors", kind: "editors", enabled: true },
      { _key: "edition", kind: "edition", enabled: true },
      { _key: "feed", kind: "feed", enabled: true },
      { _key: "shop", kind: "shop", enabled: false },
      { _key: "notes", kind: "notes", enabled: false },
    ],
  },
};

const docs = [...categories, ...authors, ...editions, ...products, settings];

if (dryRun) {
  console.log(JSON.stringify(docs, null, 2));
  console.log(`\n[dry-run] Would upsert ${docs.length} documents to ${projectId}/${dataset}.`);
  process.exit(0);
}

async function main() {
  let createClient;
  try {
    ({ createClient } = await import("@sanity/client"));
  } catch (err) {
    console.error(
      "Could not import @sanity/client. Run this script from inside the web/ folder (which has @sanity/client installed):",
    );
    console.error("  cd web && node ../scripts/seed-sanity.mjs");
    console.error("Original error:", err?.message ?? err);
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(`Seeding ${docs.length} documents to ${projectId}/${dataset}...`);
  let tx = client.transaction();
  for (const doc of docs) {
    tx = tx.createOrReplace(doc);
  }
  const res = await tx.commit({ visibility: "async" });
  console.log(`Done. Transaction id: ${res.transactionId}`);
  console.log("Seeded:");
  for (const d of docs) {
    console.log(`  - ${d._type}: ${d._id}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err?.message ?? err);
  process.exit(1);
});
