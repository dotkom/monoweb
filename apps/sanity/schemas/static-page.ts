import { defineType } from "sanity"
import badgeSection from "./sections/badge_section"
import textSection from "./sections/text_section"

const staticPageSchema = defineType({
  title: "Static Pages",
  name: "pages",
  type: "document",
  fields: [
    {
      title: "Page Name",
      name: "page_name",
      type: "string",
    },
    {
      title: "Sections",
      name: "sections",
      type: "array",
      of: [textSection, badgeSection],
    },
  ],
})

export default staticPageSchema
