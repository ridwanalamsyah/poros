import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required().min(5).max(200) }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / dek",
      type: "text",
      rows: 3,
      validation: (r) => r.max(300),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Primary author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "authors",
      title: "Co-authors (optional)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
    }),
    defineField({
      name: "edition",
      title: "Edition (optional)",
      type: "reference",
      to: [{ type: "edition" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string", validation: (r) => r.required().error("Alt text wajib diisi.") }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      validation: (r) =>
        r.custom((blocks) => {
          if (!blocks || !Array.isArray(blocks)) return true;
          const text = blocks
            .filter((b: { _type?: string }) => b?._type === "block")
            .flatMap((b: { children?: { text?: string }[] }) => b.children ?? [])
            .map((c) => c?.text ?? "")
            .join(" ");
          const words = text.split(/\s+/).filter(Boolean).length;
          if (words < 80) return `Body terlalu pendek (${words} kata). Minimal 80 kata.`;
          return true;
        }),
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
        { type: "pullQuote" },
        { type: "imageWithCaption" },
        { type: "embed" },
        { type: "callout" },
        { type: "divider" },
      ],
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "scheduledFor",
      title: "Scheduled for (optional)",
      description: "Kalau diisi & belum lewat, frontend gak tampilin artikel ini sampai waktu yang ditentukan.",
      type: "datetime",
    }),
    defineField({ name: "editorsPick", title: "Editor's pick", type: "boolean", initialValue: false }),
    defineField({ name: "views", title: "Views (manual)", type: "number" }),
  ],
  preview: {
    select: { title: "title", media: "coverImage", subtitle: "category.title" },
  },
  orderings: [
    { name: "publishedDesc", title: "Newest first", by: [{ field: "publishedAt", direction: "desc" }] },
    { name: "editorsPick", title: "Editor's picks first", by: [{ field: "editorsPick", direction: "desc" }, { field: "publishedAt", direction: "desc" }] },
  ],
});
