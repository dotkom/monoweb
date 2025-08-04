import type { DBHandle } from "@dotkomonline/db"
import type {
  Article,
  ArticleFilterQuery,
  ArticleId,
  ArticleSlug,
  ArticleTag,
  ArticleTagName,
  ArticleWrite,
} from "@dotkomonline/types"
import { compareAsc, compareDesc } from "date-fns"
import type { Pageable } from "../../query"
import { ArticleNotFoundError, ArticleWithSlugAlreadyExistsError } from "./article-error"
import type { ArticleRepository } from "./article-repository"
import type { ArticleTagLinkRepository } from "./article-tag-link-repository"
import type { ArticleTagRepository } from "./article-tag-repository"

export interface ArticleService {
  create(handle: DBHandle, input: ArticleWrite): Promise<Article>
  /**
   * Update an article by its id
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  update(handle: DBHandle, articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(handle: DBHandle, page: Pageable): Promise<Article[]>
  getAllByTags(handle: DBHandle, tags: ArticleTagName[]): Promise<Article[]>
  getById(handle: DBHandle, articleId: ArticleId): Promise<Article | null>
  getBySlug(handle: DBHandle, slug: ArticleSlug): Promise<Article | null>
  findMany(handle: DBHandle, query: ArticleFilterQuery, page: Pageable): Promise<Article[]>
  /**
   * Gets the top 10 related articles based on tags
   */
  getRelated(handle: DBHandle, article: Article): Promise<Article[]>
  getFeatured(handle: DBHandle): Promise<Article[]>
  getTags(handle: DBHandle): Promise<ArticleTag[]>
  /**
   * Add a tag to an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  addTag(handle: DBHandle, articleId: ArticleId, tag: ArticleTagName): Promise<void>
  /**
   * Remove a tag from an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  removeTag(handle: DBHandle, articleId: ArticleId, tag: ArticleTagName): Promise<void>
  setTags(handle: DBHandle, articleId: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]>
  findTagsOrderedByPopularity(handle: DBHandle): Promise<ArticleTag[]>
}

export function getArticleService(
  articleRepository: ArticleRepository,
  articleTagRepository: ArticleTagRepository,
  articleTagLinkRepository: ArticleTagLinkRepository
): ArticleService {
  return {
    async create(handle, input) {
      if (await this.getBySlug(handle, input.slug)) {
        throw new ArticleWithSlugAlreadyExistsError()
      }
      return await articleRepository.create(handle, input)
    },
    async update(handle, articleId, input) {
      const match = await articleRepository.getById(handle, articleId)
      if (match === null) {
        throw new ArticleNotFoundError(articleId)
      }
      if (input.slug !== match.slug && input.slug && (await this.getBySlug(handle, input.slug))) {
        throw new ArticleWithSlugAlreadyExistsError()
      }
      return await articleRepository.update(handle, match.id, input)
    },
    async getAll(handle, page) {
      return await articleRepository.getAll(handle, page)
    },
    async getAllByTags(handle, tags) {
      return await articleRepository.getByTags(handle, tags)
    },
    async getById(handle, articleId) {
      return await articleRepository.getById(handle, articleId)
    },
    async getBySlug(handle, slug) {
      return await articleRepository.getBySlug(handle, slug)
    },
    async findMany(handle, query, page) {
      return articleRepository.findMany(handle, query, page)
    },
    async getRelated(handle, article) {
      const articleTags = new Set(article.tags)
      const relatedArticles = await this.getAllByTags(
        handle,
        article.tags.map((tag) => tag.name)
      )
      return relatedArticles
        .filter((related) => related.id !== article.id)
        .map((related) => {
          const matchCount = related.tags.filter((tag) => articleTags.has(tag)).length
          const nonMatchCount = related.tags.length - matchCount

          return {
            article: related,
            matchCount,
            nonMatchCount,
          }
        })
        .sort((a, b) => {
          if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount
          }

          if (a.nonMatchCount !== b.nonMatchCount) {
            return a.nonMatchCount - b.nonMatchCount
          }

          return compareAsc(b.article.updatedAt, a.article.updatedAt)
        })
        .map(({ article }) => article)
        .slice(0, 10)
    },
    async getFeatured(handle) {
      const articles = await articleRepository.getFeatured(handle)
      return articles.sort((a, b) => compareDesc(a.updatedAt, b.updatedAt))
    },
    async getTags(handle) {
      const tags = await articleTagRepository.getAll(handle)
      return tags.sort((a, b) => compareAsc(a.name, b.name))
    },
    async addTag(handle, articleId, tag) {
      const match = await articleRepository.getById(handle, articleId)
      if (!match) {
        throw new ArticleNotFoundError(articleId)
      }
      let name = await articleTagRepository.getByName(handle, tag)
      if (name === null) {
        name = await articleTagRepository.create(handle, tag)
      }
      return await articleTagLinkRepository.add(handle, articleId, name.name)
    },
    async removeTag(handle, articleId, tag) {
      const match = await articleRepository.getById(handle, articleId)
      if (!match) {
        throw new ArticleNotFoundError(articleId)
      }
      await articleTagLinkRepository.remove(handle, articleId, tag)
      const articlesWithTag = await articleRepository.getByTags(handle, [tag])
      const isTagStillInUse = articlesWithTag.length !== 0
      if (!isTagStillInUse) {
        await articleTagRepository.delete(handle, tag)
      }
    },
    async setTags(handle, articleId, tags) {
      const currentTags = (await articleTagRepository.getAllByArticle(handle, articleId)).map((tag) => tag.name)
      const tagsToAdd = tags.filter((tag) => !currentTags.includes(tag))
      const tagsToRemove = currentTags.filter((tag) => !tags.includes(tag))
      const removePromises = tagsToRemove.map(async (tag) => this.removeTag(handle, articleId, tag))
      const addPromises = tagsToAdd.map(async (tag) => this.addTag(handle, articleId, tag))

      await Promise.all([...removePromises, ...addPromises])
      return currentTags.filter((tag) => !tagsToRemove.includes(tag)).concat(tagsToAdd)
    },
    async findTagsOrderedByPopularity(handle) {
      return articleRepository.findTagsOrderedByPopularity(handle, 30)
    },
  }
}
