import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type {
  Article,
  ArticleFilterQuery,
  ArticleId,
  ArticleSlug,
  ArticleTag,
  ArticleTagName,
  ArticleWrite,
  UserId,
} from "@dotkomonline/types"
import { createS3PresignedPost, slugify } from "@dotkomonline/utils"
import { compareAsc, compareDesc } from "date-fns"
import { AlreadyExistsError, NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { ArticleRepository } from "./article-repository"
import type { ArticleTagLinkRepository } from "./article-tag-link-repository"
import type { ArticleTagRepository } from "./article-tag-repository"

export interface ArticleService {
  create(handle: DBHandle, data: ArticleWrite): Promise<Article>
  /**
   * Update an article by its id
   *
   * @throws {NotFoundError} if the article does not exist
   */
  update(handle: DBHandle, articleId: ArticleId, data: Partial<ArticleWrite>): Promise<Article>
  findById(handle: DBHandle, articleId: ArticleId): Promise<Article | null>
  getById(handle: DBHandle, articleId: ArticleId): Promise<Article>
  findBySlug(handle: DBHandle, articleSlug: ArticleSlug): Promise<Article | null>
  getBySlug(handle: DBHandle, articleSlug: ArticleSlug): Promise<Article>
  findMany(handle: DBHandle, query: ArticleFilterQuery, page: Pageable): Promise<Article[]>
  findManyByTags(handle: DBHandle, articleTags: ArticleTagName[]): Promise<Article[]>
  /**
   * Gets the top 10 related articles based on tags
   */
  findRelated(handle: DBHandle, article: Article): Promise<Article[]>
  findFeatured(handle: DBHandle): Promise<Article[]>
  getTags(handle: DBHandle): Promise<ArticleTag[]>
  /**
   * Add a tag to an article
   *
   * @throws {NotFoundError} if the article does not exist
   */
  addTag(handle: DBHandle, articleId: ArticleId, tag: ArticleTagName): Promise<void>
  /**
   * Remove a tag from an article
   *
   * @throws {NotFoundError} if the article does not exist
   */
  removeTag(handle: DBHandle, articleId: ArticleId, tag: ArticleTagName): Promise<void>
  setTags(handle: DBHandle, articleId: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]>
  findTagsOrderedByPopularity(handle: DBHandle): Promise<ArticleTag[]>
  createFileUpload(
    handle: DBHandle,
    filename: string,
    contentType: string,
    createdByUserId: UserId
  ): Promise<PresignedPost>
}

export function getArticleService(
  articleRepository: ArticleRepository,
  articleTagRepository: ArticleTagRepository,
  articleTagLinkRepository: ArticleTagLinkRepository,
  s3Client: S3Client,
  s3BucketName: string
): ArticleService {
  return {
    async create(handle, data) {
      const existingArticle = await this.findBySlug(handle, data.slug)

      if (existingArticle) {
        throw new AlreadyExistsError(`Article(Slug=${data.slug}) already exists`)
      }

      return await articleRepository.create(handle, data)
    },

    async update(handle, articleId, data) {
      const article = await this.getById(handle, articleId)

      if (data.slug && data.slug !== article.slug) {
        const possibleDuplicate = await this.findBySlug(handle, data.slug)

        if (possibleDuplicate) {
          throw new AlreadyExistsError(`Article(Slug=${data.slug}) already exists`)
        }
      }

      return await articleRepository.update(handle, article.id, data)
    },

    async findManyByTags(handle, articleTags) {
      return await articleRepository.findManyByTags(handle, articleTags)
    },

    async findById(handle, articleId) {
      return await articleRepository.findById(handle, articleId)
    },

    async getById(handle, articleId) {
      const article = await this.findById(handle, articleId)

      if (!article) {
        throw new NotFoundError(`Article(ID=${articleId}) not found`)
      }

      return article
    },

    async findBySlug(handle, articleSlug) {
      return await articleRepository.findBySlug(handle, articleSlug)
    },

    async getBySlug(handle, articleSlug) {
      const article = await this.findBySlug(handle, articleSlug)

      if (!article) {
        throw new NotFoundError(`Article(Slug=${articleSlug}) not found`)
      }

      return article
    },

    async findMany(handle, query, page) {
      return articleRepository.findMany(handle, query, page)
    },

    async findRelated(handle, article) {
      const articleTags = new Set(article.tags)

      const relatedArticles = await this.findManyByTags(
        handle,
        [...articleTags].map((tag) => tag.name)
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

    async findFeatured(handle) {
      const articles = await articleRepository.findFeatured(handle)
      return articles.toSorted((a, b) => compareDesc(a.updatedAt, b.updatedAt))
    },

    async getTags(handle) {
      const tags = await articleTagRepository.findMany(handle)
      return tags.toSorted((a, b) => compareAsc(a.name, b.name))
    },

    async addTag(handle, articleId, tag) {
      await this.getById(handle, articleId) // Verify the article exists

      let name = await articleTagRepository.findByName(handle, tag)
      if (name === null) {
        name = await articleTagRepository.create(handle, tag)
      }

      return await articleTagLinkRepository.add(handle, articleId, name.name)
    },

    async removeTag(handle, articleId, tag) {
      await this.getById(handle, articleId) // Verify the article exists

      await articleTagLinkRepository.remove(handle, articleId, tag)

      const articlesWithTag = await articleRepository.findManyByTags(handle, [tag])
      const isTagStillInUse = articlesWithTag.length !== 0

      if (!isTagStillInUse) {
        await articleTagRepository.delete(handle, tag)
      }
    },

    async setTags(handle, articleId, tags) {
      await this.getById(handle, articleId) // Verify the article exists

      const currentTags = await articleTagRepository.findManyByArticleId(handle, articleId)
      const currentTagNames = currentTags.map((tag) => tag.name)

      const tagsToAdd = tags.filter((tag) => !currentTagNames.includes(tag))
      const tagsToRemove = currentTagNames.filter((tag) => !tags.includes(tag))

      const addPromises = tagsToAdd.map(async (tag) => this.addTag(handle, articleId, tag))
      const removePromises = tagsToRemove.map(async (tag) => this.removeTag(handle, articleId, tag))

      await Promise.all([...removePromises, ...addPromises])

      return currentTagNames.filter((tag) => !tagsToRemove.includes(tag)).concat(tagsToAdd)
    },

    async findTagsOrderedByPopularity(handle) {
      // magic number
      return articleRepository.findTagsOrderedByPopularity(handle, 30)
    },

    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `article/${Date.now()}-${uuid}-${slugify(filename)}`

      const maxSizeKiB = 5 * 1024 // 5 MiB, arbitrarily set

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB,
        contentType,
        createdByUserId,
      })
    },
  }
}
