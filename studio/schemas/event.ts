import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "startAt", title: "Starts at", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "endAt", title: "Ends at", type: "datetime" }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({ name: "city", title: "City", type: "string", initialValue: "Bandung" }),
    defineField({ name: "ticketUrl", title: "Ticket / RSVP URL", type: "url" }),
    defineField({ name: "free", title: "Free entry", type: "boolean", initialValue: false }),
    defineField({
      name: "coverImage",
      type: "image",
      description: "Min 2400×1600. Geser hotspot ke subjek utama supaya tidak terpotong di thumbnail.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
  ],
  preview: { select: { title: "title", subtitle: "startAt", media: "coverImage" } },
  orderings: [{ name: "startAsc", title: "Soonest first", by: [{ field: "startAt", direction: "asc" }] }],
});
