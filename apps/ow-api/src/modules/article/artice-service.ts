import { NotFoundError } from "../../errors/errors"
import { Article } from "./article"
import { ArticleRepository } from "./article-repository"

export interface ArticleService {
  getArticle: (slug: Article["slug"]) => Promise<Article>
  getArticles: (limit: number) => Promise<Article[]>
}

export const initArticleService = (articleRepository: ArticleRepository): ArticleService => ({
  getArticle: async (slug) => {
    const article = await articleRepository.getArticleBySlug(slug)
    if (!article) throw new NotFoundError(`Article with slug:${slug} not found`)
    return article
  },
  getArticles: async (limit) => {
    const articles = await articleRepository.getArticles(limit)
    return articles
  },
})
