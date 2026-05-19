import { defineField, defineType } from "sanity";

export default defineType({
  name: "submission",
  title: "Pitch submission",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "text", rows: 10, validation: (r) => r.required() }),
    defineField({ name: "submittedAt", type: "datetime" }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["new", "reviewing", "accepted", "declined"] },
      initialValue: "new",
    }),
  ],
  preview: { select: { title: "title", subtitle: "name" } },
});
