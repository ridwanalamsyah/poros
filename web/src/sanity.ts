import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImage } from "./types";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? "production";
const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION as string | undefined) ?? "2024-10-01";

export const sanityEnabled = Boolean(projectId);

export const sanity: SanityClient | null = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

const builder = sanity ? imageUrlBuilder(sanity) : null;

export function urlFor(image?: SanityImage | null) {
  if (!builder || !image || !image.asset) return null;
  return builder.image(image);
}

export function imageUrl(image: SanityImage | undefined, w = 1200): string | undefined {
  if (!image) return undefined;
  if (typeof (image as unknown as { _placeholderUrl?: string })._placeholderUrl === "string") {
    return (image as unknown as { _placeholderUrl?: string })._placeholderUrl;
  }
  const b = urlFor(image);
  return b ? b.width(w).auto("format").quality(80).url() : undefined;
}

export function lqipFor(image?: SanityImage): string | undefined {
  return image?.asset?.metadata?.lqip ?? image?.lqip;
}
