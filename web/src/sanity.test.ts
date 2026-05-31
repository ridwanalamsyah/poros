import { describe, expect, it } from "vitest";
import { focalPointStyle, imageUrl } from "./sanity";
import type { SanityImage } from "./types";

describe("focalPointStyle", () => {
  it("returns undefined when there is no hotspot", () => {
    expect(focalPointStyle(undefined)).toBeUndefined();
    expect(focalPointStyle({ _type: "image" } as SanityImage)).toBeUndefined();
  });

  it("maps a hotspot to an object-position percentage", () => {
    const img = { _type: "image", hotspot: { x: 0.25, y: 0.8 } } as SanityImage;
    expect(focalPointStyle(img)).toEqual({ objectPosition: "25.00% 80.00%" });
  });
});

describe("imageUrl", () => {
  it("returns undefined for missing image", () => {
    expect(imageUrl(undefined)).toBeUndefined();
  });

  it("short-circuits to a placeholder url when present", () => {
    const placeholder = { _placeholderUrl: "/covers/local.jpg" } as unknown as SanityImage;
    expect(imageUrl(placeholder)).toBe("/covers/local.jpg");
  });
});
