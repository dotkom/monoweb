import { defineField, defineType } from "sanity";
import { sectionPreview } from "./section_preview";

const badgeSection = defineType({
  title: "Badge Section",
  name: "badge_section",
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
    defineField({
      title: "Badges",
      name: "badges",
      type: "array",
      of: [
        {
          title: "Badge",
          name: "badge",
          type: "object",
          fields: [
            {
              name: "badge_title",
              type: "string",
            },
            {
              name: "badge_url",
              type: "image",
            },
          ],
        },
      ],
    }),
  ],
  preview: sectionPreview,
});

export default badgeSection;
