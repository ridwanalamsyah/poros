import { defineField, defineType } from "sanity";

export default defineType({
  name: "colophon",
  title: "Colophon",
  type: "document",
  description: "Masthead, kontak, kru editorial. Singleton.",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Masthead" }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "members",
      title: "Members",
      type: "array",
      of: [
        {
          type: "object",
          name: "member",
          fields: [
            defineField({ name: "name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "role", type: "string", validation: (r) => r.required() }),
            defineField({ name: "email", type: "string" }),
            defineField({ name: "link", type: "url" }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        },
      ],
    }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string" }),
    defineField({ name: "pitchEmail", title: "Pitch email", type: "string" }),
    defineField({ name: "lettersEmail", title: "Letters email", type: "string" }),
    defineField({ name: "address", title: "Address (optional)", type: "text", rows: 2 }),
  ],
});
