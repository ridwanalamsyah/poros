import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string", initialValue: "Velvet Collapse Magazine" }),
    defineField({ name: "siteDescription", type: "text", rows: 2 }),
    defineField({ name: "tipJarSaweria", title: "Saweria URL", type: "url" }),
    defineField({ name: "tipJarTrakteer", title: "Trakteer URL", type: "url" }),
    defineField({ name: "tipJarPatreon", title: "Patreon URL", type: "url" }),
    defineField({ name: "cusdisAppId", title: "Cusdis App ID (for comments)", type: "string" }),
    defineField({ name: "newsletterEndpoint", title: "Newsletter endpoint (optional override)", type: "url" }),
    defineField({
      name: "editorsNote",
      title: "Editor's note marquee",
      description: "Strip teks di paling atas header (kosongkan kalau mau hilang).",
      type: "string",
    }),
    defineField({
      name: "reactionsEnabled",
      title: "Reactions on articles?",
      description: "Munculin tombol heart / fire / skull di bawah artikel.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "twitter", type: "url" }),
        defineField({ name: "threads", type: "url" }),
        defineField({ name: "bluesky", type: "url" }),
        defineField({ name: "linkedin", type: "url" }),
        defineField({ name: "facebook", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
      ],
    }),
    defineField({
      name: "homepageLayout",
      title: "Homepage Layout (admin control)",
      type: "object",
      description: "Atur urutan & visibility section di homepage. Drag untuk reorder.",
      fields: [
        defineField({
          name: "sections",
          title: "Sections (urutan top \u2192 bottom)",
          type: "array",
          of: [
            {
              type: "object",
              name: "section",
              fields: [
                defineField({
                  name: "kind",
                  title: "Section",
                  type: "string",
                  options: {
                    list: [
                      { title: "Hero (artikel utama)", value: "hero" },
                      { title: "From The Editors", value: "editors" },
                      { title: "Current Edition", value: "edition" },
                      { title: "Notes", value: "notes" },
                      { title: "Most Popular", value: "popular" },
                      { title: "All Articles Feed", value: "feed" },
                      { title: "Shop Strip", value: "shop" },
                    ],
                  },
                }),
                defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
                defineField({ name: "title", title: "Override title (optional)", type: "string" }),
              ],
              preview: {
                select: { kind: "kind", enabled: "enabled" },
                prepare({ kind, enabled }) {
                  return { title: `${enabled === false ? "\u2715 " : ""}${kind ?? "(unset)"}` };
                },
              },
            },
          ],
        }),
        defineField({ name: "heroArticle", title: "Pinned hero article (optional)", type: "reference", to: [{ type: "article" }] }),
      ],
    }),
  ],
  preview: { select: { title: "siteTitle" } },
});
