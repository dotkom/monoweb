import { Article } from "./article"
import { SanityClient } from "@sanity/client"
import { getArticleBySlugQuery, getArticlesQuery, getSortedArticlesQuery } from "./repository-types/get-article"

export interface ArticleRepository {
  getArticleBySlug: (slug: string) => Promise<Article | undefined>
  getArticles: (limit: number) => Promise<Article[]>
  getArticlesSortedByTitle: (limit: number) => Promise<Article[]>
}

export const initArticleRepository = (client: SanityClient): ArticleRepository => {
  const repo: ArticleRepository = {
    getArticleBySlug: async (slug) => {
      const article = await client.fetch(getArticleBySlugQuery, { slug })
      return article
    },
    getArticles: async (limit) => {
      const articles = await client.fetch(getArticlesQuery, { limit })
      return articles
    },
    getArticlesSortedByTitle: async (limit) => {
      const articles = await client.fetch(getSortedArticlesQuery, { limit })
      return articles
    },
  }
  return repo
}
