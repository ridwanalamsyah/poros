import { describe, expect, it } from "vitest";
import {
  blocksToPlainText,
  fallbackCover,
  formatIDR,
  readingMinutes,
  relativeTime,
} from "./text";

describe("readingMinutes", () => {
  it("returns at least 1 minute for short text", () => {
    expect(readingMinutes("just a few words")).toBe(1);
  });

  it("scales with word count and wpm", () => {
    const text = Array.from({ length: 440 }, () => "word").join(" ");
    expect(readingMinutes(text, 220)).toBe(2);
  });
});

describe("formatIDR", () => {
  it("formats integers as IDR currency without decimals", () => {
    const out = formatIDR(150000);
    expect(out).toContain("150.000");
    expect(out).toContain("Rp");
    expect(out).not.toContain(",00");
  });
});

describe("relativeTime", () => {
  const now = Date.parse("2026-01-10T12:00:00Z");

  it("returns empty string for missing input", () => {
    expect(relativeTime(undefined, now)).toBe("");
  });

  it("reports minutes, hours and days ago with pluralization", () => {
    expect(relativeTime("2026-01-10T11:30:00Z", now)).toBe("30 minutes ago");
    expect(relativeTime("2026-01-10T11:00:00Z", now)).toBe("1 hour ago");
    expect(relativeTime("2026-01-08T12:00:00Z", now)).toBe("2 days ago");
  });

  it("echoes back unparseable dates", () => {
    expect(relativeTime("not-a-date", now)).toBe("not-a-date");
  });
});

describe("fallbackCover", () => {
  it("is deterministic for the same category + key", () => {
    expect(fallbackCover("music", "abc")).toBe(fallbackCover("music", "abc"));
  });

  it("falls back to the default bucket for unknown categories", () => {
    const url = fallbackCover("nonexistent-category", "x");
    expect(url.startsWith("https://images.unsplash.com/")).toBe(true);
  });
});

describe("blocksToPlainText", () => {
  it("joins block children text and ignores non-block types", () => {
    const blocks = [
      { _type: "block", children: [{ text: "Hello " }, { text: "world" }] },
      { _type: "image" },
      { _type: "block", children: [{ text: "Second" }] },
    ];
    expect(blocksToPlainText(blocks)).toBe("Hello world\n\nSecond");
  });

  it("returns empty string when blocks are undefined", () => {
    expect(blocksToPlainText(undefined)).toBe("");
  });
});
