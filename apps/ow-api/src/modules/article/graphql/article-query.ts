import { intArg, list, queryField, stringArg } from "nexus"

export const articleQuery = queryField("article", {
  type: "Article",
  args: {
    slug: stringArg(),
  },
  resolve: async (_, args, ctx) => {
    const { slug } = args
    const article = await ctx.articleService.getArticle(slug)
    return article
  },
})

export const articlesQuery = queryField("articles", {
  type: list("Article"),
  args: {
    limit: intArg({ default: 10 }),
  },
  resolve: async (_, args, ctx) => {
    return ctx.articleService.getArticles(args.limit)
  },
})
