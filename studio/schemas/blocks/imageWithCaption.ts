import { defineField, defineType } from "sanity";

export default defineType({
  name: "imageWithCaption",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", type: "string", validation: (r) => r.required().error("Alt text wajib.") }),
    defineField({ name: "caption", type: "string" }),
  ],
});
