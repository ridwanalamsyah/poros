import { defineField, defineType } from "sanity";

export default defineType({
  name: "edition",
  title: "Edition / Issue",
  type: "document",
  fields: [
    defineField({ name: "issueNumber", title: "Issue number", type: "string", description: "e.g. 001, 002" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "accentColor",
      title: "Accent colour",
      type: "string",
      description: "Optional per-edition accent as a hex colour (e.g. #C1272D). Falls back to the house red when empty.",
      validation: (r) => r.regex(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: "hex colour" }),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
  ],
  preview: { select: { title: "title", subtitle: "issueNumber", media: "coverImage" } },
  orderings: [{ name: "publishedDesc", title: "Newest first", by: [{ field: "publishedAt", direction: "desc" }] }],
});
