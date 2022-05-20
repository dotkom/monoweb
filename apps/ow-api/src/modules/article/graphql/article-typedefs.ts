import { objectType } from "nexus"

export const Article = objectType({
  name: "Article",
  description: "A generic Onlineweb article",
  definition(t) {
    t.string("slug")
    t.string("title")
    t.string("author")
    t.string("createdAt")
    t.string("updatedAt")
    t.list.string("tags")
    t.string("excerpt")
    t.string("coverImage")
    t.int("estimatedReadingTime")
    t.string("photographer")
    t.string("content")
  },
})
