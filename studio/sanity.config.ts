import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./desk";

const projectId = (typeof process !== "undefined" && process.env.SANITY_STUDIO_PROJECT_ID) || "placeholder-project";
const dataset = (typeof process !== "undefined" && process.env.SANITY_STUDIO_DATASET) || "production";

export default defineConfig({
  name: "poros",
  title: "POROS — Studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
