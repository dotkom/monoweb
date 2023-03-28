import { defineField, defineType } from "sanity"

export const interestgroupsSchema = defineType({
  name: "interestgroup",
  type: "document",
  title: "Interessegrupper",
  fields: [
    defineField({
      name: "interestgroup_name",
      title: "Interessegruppe navn",
      type: "string",
      validation: (Rule) => Rule.required().error("Interesse gruppe krever et navn"),
    }),
    defineField({
        name: "interestgroup_description",
        title: "Interessegruppe beskrivelse",
        type: "text",
        validation: Rule => [
            Rule.required().error("Interesse gruppe krever en beskrivelse"),
            Rule.min(100).warning("Beskrivelsen bør ikke være lengre enn 100 ord")
        ]
        // must contain 100 words
    }), defineField({
        name: "logo_url",
        title: "Interessegruppe logo",
        type: "image",
        //add crop and aspect ratio
        options: {
            hotspot: true,
        }

    }), defineField({
        name: "wiki_link",
        title: "Wiki link",
        type: "url",
    }),
    defineField({
        name: "bannerimage_url",
        title: "Banner bilde",
        type: "image",
    }),
    defineField({
        name: "bannercolor",
        title: "Banner farge",
        type: "color",
    }),
    
  ],
})
