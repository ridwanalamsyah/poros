/**
 * One-off migration: upload the local cover images in `web/public/covers/`
 * (~21 MB that currently ships in the static build) to the Sanity asset CDN,
 * then rewrite the `/covers/...` references in `src/data/mock.ts` to the
 * returned `cdn.sanity.io` URLs.
 *
 * After running successfully you can delete `web/public/covers/` to drop the
 * weight from the bundle.
 *
 * Usage:
 *   VITE_SANITY_PROJECT_ID=lyo17dt8 \
 *   VITE_SANITY_DATASET=production \
 *   VITE_SANITY_WRITE_TOKEN=sk... \
 *   node scripts/migrate-covers.mjs [--dry-run]
 */
import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MOCK = path.join(ROOT, "src/data/mock.ts");
const COVERS_DIR = path.join(ROOT, "public/covers");

const dryRun = process.argv.includes("--dry-run");

const projectId = process.env.VITE_SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET ?? "production";
const token = process.env.VITE_SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing VITE_SANITY_PROJECT_ID");
  process.exit(1);
}
if (!dryRun && !token) {
  console.error("Missing VITE_SANITY_WRITE_TOKEN (required unless --dry-run)");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

const source = await readFile(MOCK, "utf8");
const refs = [...new Set([...source.matchAll(/\/covers\/[^"']+/g)].map((m) => m[0]))];

if (!refs.length) {
  console.log("No /covers references found in mock.ts — nothing to do.");
  process.exit(0);
}
console.log(`Found ${refs.length} unique /covers references.`);

if (dryRun) {
  for (const r of refs) console.log("  would upload:", r);
  process.exit(0);
}

let out = source;
let migrated = 0;
for (const ref of refs) {
  const file = path.join(COVERS_DIR, path.basename(ref));
  try {
    await access(file);
  } catch {
    console.warn("  skip (file missing):", ref);
    continue;
  }
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: path.basename(file),
  });
  out = out.split(ref).join(asset.url);
  migrated++;
  console.log(`  uploaded ${path.basename(file)} -> ${asset.url}`);
}

await writeFile(MOCK, out, "utf8");
console.log(`\nDone. Migrated ${migrated}/${refs.length} images and rewrote mock.ts.`);
console.log("Next: verify the app, then `git rm -r web/public/covers` to drop ~21 MB from the build.");
