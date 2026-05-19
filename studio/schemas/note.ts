import { defineField, defineType } from "sanity";

export default defineType({
  name: "note",
  title: "Note",
  type: "document",
  fields: [
    defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.required().max(500) }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "publishedAt", type: "datetime", initialValue: () => new Date().toISOString() }),
  ],
  preview: { select: { title: "body", subtitle: "author.name" } },
});
