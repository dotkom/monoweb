import { defineField, defineType } from "sanity"

export const articleSchema = defineType({
  name: "article",
  type: "document",
  title: "Artikkel",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required().error("Krever en tittel"),
    }),
    defineField({
      name: "author",
      title: "Forfatter",
      type: "string",
    }),
    defineField({
      name: "photographer",
      title: "Fotograf",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "cover_image",
      title: "Forsidebilde",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "slug",
      title: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 80,
      },
    }),
    defineField({
      name: "excerpt",
      title: "Ingress",
      type: "text",
    }),
    defineField({
      name: "content",
      title: "Innhold",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    }),
  ],
})
