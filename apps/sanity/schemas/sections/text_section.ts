import { defineField, defineType } from "sanity";
import { sectionPreview } from "./section_preview";

const textSection = defineType({
  title: "Text Section",
  name: "text_section",
  type: "object",
  fields: [
    defineField({
      title: "Section Name",
      name: "section_name",
      type: "string",
    }),
    defineField({
      title: "Content",
      name: "content",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: sectionPreview,
});

export default textSection;
