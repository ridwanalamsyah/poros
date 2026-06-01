import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Short one-liner that shows under the title on the product detail page.",
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Plain text used on the shop grid and meta description.",
    }),
    defineField({
      name: "body",
      title: "Long description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description: "Rich-text body shown on the product detail page.",
    }),
    defineField({ name: "price", title: "Price (IDR)", type: "number", validation: (r) => r.required().positive() }),
    defineField({
      name: "image",
      title: "Primary image",
      type: "image",
      description: "Min 1600×1600. Geser hotspot ke subjek utama supaya tidak terpotong di thumbnail.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string" })],
        }),
      ],
      description: "Additional product photos shown as a gallery on the detail page. Geser hotspot tiap foto ke subjek utama.",
    }),
    defineField({
      name: "specs",
      title: "Specs",
      description: "Optional list of detail pairs (e.g. \"Halaman / 96\").",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "value", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "shippingNote",
      type: "string",
      description: "Override the default shipping line (e.g. \"Dikirim 3–5 hari dari Bandung.\").",
    }),
    defineField({ name: "inStock", type: "boolean", initialValue: true }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
      description: "Pin near the top of the shop grid.",
    }),
  ],
  preview: {
    select: { title: "title", media: "image", price: "price", inStock: "inStock" },
    prepare({ title, media, price, inStock }) {
      const sub = typeof price === "number" ? `Rp${price.toLocaleString("id-ID")}` : "—";
      return {
        title: title ?? "(product)",
        subtitle: inStock === false ? `${sub} · sold out` : sub,
        media,
      };
    },
  },
});
