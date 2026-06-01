import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { CSSProperties } from "react";
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

export function imageUrl(image: SanityImage | undefined, w = 1200, h?: number): string | undefined {
  if (!image) return undefined;
  if (typeof (image as unknown as { _placeholderUrl?: string })._placeholderUrl === "string") {
    return (image as unknown as { _placeholderUrl?: string })._placeholderUrl;
  }
  let b = urlFor(image);
  if (!b) return undefined;
  b = b.width(w).auto("format").quality(80);
  if (h) b = b.height(h).fit("crop").crop("focalpoint");
  return b.url();
}

/**
 * CSS object-position derived from a Sanity hotspot so that `object-cover`
 * crops around the editor-chosen focal point instead of always center-cropping.
 */
export function focalPointStyle(image?: SanityImage | null): CSSProperties | undefined {
  const hot = image?.hotspot;
  if (!hot || typeof hot.x !== "number" || typeof hot.y !== "number") return undefined;
  return { objectPosition: `${(hot.x * 100).toFixed(2)}% ${(hot.y * 100).toFixed(2)}%` };
}

export function lqipFor(image?: SanityImage): string | undefined {
  return image?.asset?.metadata?.lqip ?? image?.lqip;
}
