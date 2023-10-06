import { defineField, defineType } from "sanity";

export const offlineSchema = defineType({
  name: "offline",
  type: "document",
  title: "Offline",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required().error("Krever en tittel"),
    }),
    defineField({
      name: "pdf",
      title: "Offline PDF fil",
      type: "file",
    }),
    defineField({
      name: "release_date",
      title: "Utgivelse dato",
      type: "date",
    }),
    defineField({
      name: "thumbnail",
      title: "Bilde av forsiden",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
