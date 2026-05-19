import { defineField, defineType } from "sanity";

export default defineType({
  name: "callout",
  title: "Callout",
  type: "object",
  fields: [
    defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "tone",
      type: "string",
      options: { list: ["info", "warn", "accent"] },
      initialValue: "accent",
    }),
  ],
  preview: { select: { title: "text", subtitle: "tone" } },
});
