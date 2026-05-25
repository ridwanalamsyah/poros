import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./desk";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "lyo17dt8";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "poros",
  title: "Velvet Collapse Magazine — Studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
