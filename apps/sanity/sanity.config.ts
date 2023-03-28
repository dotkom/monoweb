import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./schemas"
import { colorInput } from "@sanity/color-input";

export default defineConfig({
  name: "default",
  title: "onlineweb-cms",

  projectId: "wsqi2mae",
  dataset: "production",

  plugins: [deskTool(), visionTool(), colorInput()],

  schema: {
    types: schemaTypes,
  },
})
