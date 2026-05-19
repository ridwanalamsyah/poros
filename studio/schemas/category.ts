import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "sortOrder", type: "number", initialValue: 10, description: "Lower = first in nav." }),
    defineField({ name: "color", type: "string", description: "Optional hex like #c1272d for category accent." }),
  ],
  orderings: [
    { name: "sort", title: "Sort order", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
