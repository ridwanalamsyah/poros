import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title (SEO / window title)",
      type: "string",
      initialValue: "Velvet Collapse Magazine",
    }),
    defineField({
      name: "siteDescription",
      title: "Site description (SEO meta)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "brandWordmark",
      title: "Brand wordmark (header + footer display name)",
      description: "Tampil di logo atas dan bawah. Kosongkan untuk pakai siteTitle.",
      type: "string",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer tagline",
      description: "Kalimat italic kecil di bawah wordmark footer. Default: 'Built from the mess.'",
      type: "string",
    }),
    defineField({
      name: "copyrightLine",
      title: "Copyright / colophon line",
      description: "Baris terakhir di footer (di atas link COLOPHON). Default: '{BRAND} \u00b7 {YEAR} \u00b7 BANDUNG'.",
      type: "string",
    }),
    defineField({
      name: "tipJarHeading",
      title: "Tip-jar heading",
      description: "Default: 'DUKUNG REDAKSI'.",
      type: "string",
    }),
    defineField({
      name: "tipJarBlurb",
      title: "Tip-jar blurb (1\u20132 kalimat)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "tipJarPlacement",
      title: "Tip-jar placement",
      description: "Bagaimana tip-jar muncul di footer.",
      type: "string",
      options: {
        list: [
          { title: "Footer \u2014 center (single button, expand on click)", value: "button" },
          { title: "Footer \u2014 stacked buttons di tengah", value: "footer-center" },
          { title: "Footer \u2014 kolom kanan dalam grid", value: "footer-right" },
          { title: "Hidden (sembunyikan dari footer; tetap muncul di Colophon)", value: "hidden" },
        ],
        layout: "radio",
      },
      initialValue: "button",
    }),
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
