import { defineField, defineType } from "sanity";

export default defineType({
  name: "embed",
  title: "Embed (YouTube / Spotify / link)",
  type: "object",
  fields: [
    defineField({ name: "url", type: "url", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "url" } },
});
