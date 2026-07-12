// Server-only Sanity client. Uses SANITY_WRITE_TOKEN (no VITE_ prefix), which
// is never bundled into client JS. All admin writes (submissions, letters,
// orders, reactions) go through functions in this /api folder instead of
// writing directly from the browser.
import { createClient } from "@sanity/client";

export function getSanityAdmin() {
  const projectId = process.env.SANITY_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET ?? process.env.VITE_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_WRITE_TOKEN;

  if (!projectId || !token) return null;

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
  });
}
