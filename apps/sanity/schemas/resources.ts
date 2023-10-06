import { defineField, defineType } from "sanity";

export const resourceSchema = defineType({
  name: "resource",
  type: "document",
  title: "Ressurser",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required().error("krever en tittel"),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required().error("krever en beskrivelse"),
    }),
    defineField({
      name: "thumbnail",
      title: "Ressurs bilde",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "image_description",
          type: "string",
          title: "Bildebeskrivelse",
          validation: (Rule) => Rule.required().error("Bildet trenger en beskrivelse. Trykk på 'Edit details'"),
        }),
      ],
    }),
  ],
});
