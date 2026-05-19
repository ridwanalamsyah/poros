import { defineType } from "sanity";

export default defineType({
  name: "divider",
  title: "Divider",
  type: "object",
  fields: [
    {
      name: "label",
      title: "Divider mark",
      type: "string",
      readOnly: true,
      initialValue: "— § —",
    },
  ],
  preview: { prepare: () => ({ title: "— § —" }) },
});
