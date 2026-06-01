import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "liveblog",
  title: "Live blog",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Live", value: "live" }, { title: "Ended", value: "ended" }], layout: "radio" },
      initialValue: "live",
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({ name: "startedAt", title: "Started at", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "entries",
      title: "Entries",
      description: "Newest entries are shown first on the page.",
      type: "array",
      of: [
        defineArrayMember({
          name: "liveEntry",
          title: "Entry",
          type: "object",
          fields: [
            defineField({ name: "timestamp", title: "Timestamp", type: "datetime", initialValue: () => new Date().toISOString(), validation: (r) => r.required() }),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 4, validation: (r) => r.required() }),
            defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
          ],
          preview: { select: { title: "heading", subtitle: "timestamp" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "status", media: "coverImage" } },
  orderings: [{ name: "startedDesc", title: "Newest first", by: [{ field: "startedAt", direction: "desc" }] }],
});
