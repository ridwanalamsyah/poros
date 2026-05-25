import { defineCliConfig } from "sanity/cli";

const projectId = (typeof process !== "undefined" && process.env.SANITY_STUDIO_PROJECT_ID) || "placeholder-project";
const dataset = (typeof process !== "undefined" && process.env.SANITY_STUDIO_DATASET) || "production";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "velvet-collapse-magazine",
});
