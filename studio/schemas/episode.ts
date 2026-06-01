import { defineField, defineType } from "sanity";

export default defineType({
  name: "episode",
  title: "Podcast episode",
  type: "document",
  fields: [
    defineField({ name: "episodeNumber", title: "Episode number", type: "number" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({
      name: "audioUrl",
      title: "Audio URL",
      type: "url",
      description: "Direct link to the episode audio file (mp3/m4a) hosted on your podcast host or CDN.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "duration", title: "Duration", type: "string", description: "e.g. 48:12" }),
    defineField({
      name: "coverImage",
      type: "image",
      description: "Min 2400×1600. Geser hotspot ke subjek utama supaya tidak terpotong di thumbnail.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({ name: "guests", title: "Guests", type: "array", of: [{ type: "reference", to: [{ type: "author" }] }] }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", initialValue: () => new Date().toISOString() }),
  ],
  preview: { select: { title: "title", subtitle: "episodeNumber", media: "coverImage" } },
  orderings: [{ name: "publishedDesc", title: "Newest first", by: [{ field: "publishedAt", direction: "desc" }] }],
});
