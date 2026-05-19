import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "price", title: "Price (IDR)", type: "number", validation: (r) => r.required().positive() }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({ name: "inStock", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "title", media: "image", subtitle: "price" } },
});
