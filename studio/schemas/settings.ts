import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string", initialValue: "POROS" }),
    defineField({ name: "siteDescription", type: "text", rows: 2 }),
    defineField({ name: "tipJarSaweria", title: "Saweria URL", type: "url" }),
    defineField({ name: "tipJarTrakteer", title: "Trakteer URL", type: "url" }),
    defineField({ name: "tipJarPatreon", title: "Patreon URL", type: "url" }),
    defineField({ name: "cusdisAppId", title: "Cusdis App ID (for comments)", type: "string" }),
    defineField({ name: "newsletterEndpoint", title: "Newsletter endpoint (optional override)", type: "url" }),
  ],
  preview: { select: { title: "siteTitle" } },
});
