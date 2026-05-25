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
    defineField({
      name: "reactionLabels",
      title: "Reaction labels",
      description: "Label tombol reaksi pembaca di akhir artikel. Pakai teks pendek, bukan simbol. Default: Suka, Penting, Kena banget.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "colophon",
      title: "Colophon",
      description: "Halaman kredit produksi: siapa mengerjakan apa, tech stack, ucapan terima kasih. Ditampilkan di /colophon.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
  ],
  preview: { select: { title: "siteTitle" } },
});
