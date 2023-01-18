import { defineField, defineType } from "sanity"

export const careerSchema = defineType({
  name: "career",
  type: "document",
  title: "Karriere",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required().error("Krever en tittel"),
    }),
    defineField({
      name: "company_name",
      title: "Navn på bedrift",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Bilde",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "career_type",
      title: "Ansettelsesform",
      type: "string",
    }),
    defineField({
      name: "career_role",
      title: "Rolle / Stilling",
      type: "string",
    }),
    defineField({
      name: "linkdin",
      title: "Linkdin - optional",
      type: "string",
    }),
    defineField({
      name: "twitter",
      title: "Twitter - optional",
      type: "string",
    }),
    defineField({
      name: "facebook",
      title: "Facebook - optional",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Sted",
      type: "string",
    }),
    defineField({
      name: "deadline",
      title: "Frist",
      type: "date",
    }),
    defineField({
      name: "company_info",
      title: "Informasjon om bedriften",
      type: "text",
    }),
    defineField({
      name: "content",
      title: "Innhold",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "link",
      title: "Søknadslink",
      type: "url",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "_id",
      },
    }),
  ],
})
