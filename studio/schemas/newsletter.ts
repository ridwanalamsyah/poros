import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsletter",
  title: "Newsletter issue",
  type: "document",
  description: "Arsip newsletter (1 dokumen = 1 kiriman).",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "sentAt", title: "Sent at", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "externalUrl", title: "External (Buttondown/Substack) URL", type: "url" }),
  ],
  orderings: [
    { name: "sentDesc", title: "Newest first", by: [{ field: "sentAt", direction: "desc" }] },
  ],
});
