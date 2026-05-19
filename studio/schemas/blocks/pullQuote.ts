import { defineField, defineType } from "sanity";

export default defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "attribution", type: "string" }),
  ],
  preview: { select: { title: "text", subtitle: "attribution" } },
});
