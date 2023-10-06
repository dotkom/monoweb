import { PreviewConfig } from "sanity";

/**
 * Sets the preview text of the the section name to the section_name
 */
export const sectionPreview: PreviewConfig = {
  select: {
    section_name: "section_name",
  },
  prepare: (data) => {
    return {
      title: (data.section_name as string)
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    };
  },
};
