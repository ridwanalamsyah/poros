import { defineField, defineType } from "sanity";

export default defineType({
  name: "reaction",
  title: "Reaction count",
  type: "document",
  description: "Counter agregat per artikel. Tiap dokumen 1 artikel.",
  fields: [
    defineField({
      name: "article",
      title: "Article",
      type: "reference",
      to: [{ type: "article" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "heart", title: "Heart count", type: "number", initialValue: 0 }),
    defineField({ name: "fire", title: "Fire count", type: "number", initialValue: 0 }),
    defineField({ name: "skull", title: "Skull count", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "article.title", heart: "heart", fire: "fire", skull: "skull" },
    prepare({ title, heart, fire, skull }) {
      return { title: title ?? "(no article)", subtitle: `heart ${heart ?? 0} / fire ${fire ?? 0} / skull ${skull ?? 0}` };
    },
  },
});
