import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { compareAsc } from "date-fns"
import type { Pageable } from "../../query"
import { ArticleNotFoundError, ArticleWithSlugAlreadyExistsError } from "./article-error"
import type { ArticleRepository } from "./article-repository"
import type { ArticleTagLinkRepository } from "./article-tag-link-repository"
import type { ArticleTagRepository } from "./article-tag-repository"

export interface ArticleService {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(page: Pageable): Promise<Article[]>
  getAllByTags(tags: ArticleTagName[]): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  getRelated(article: Article): Promise<Article[]>

  getTags(): Promise<ArticleTag[]>
  addTag(id: ArticleId, tag: ArticleTagName): Promise<void>
  removeTag(id: ArticleId, tag: ArticleTagName): Promise<void>
  setTags(id: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]>
}

export class ArticleServiceImpl implements ArticleService {
  private readonly articleRepository: ArticleRepository
  private readonly articleTagRepository: ArticleTagRepository
  private readonly articleTagLinkRepository: ArticleTagLinkRepository

  constructor(
    articleRepository: ArticleRepository,
    articleTagRepository: ArticleTagRepository,
    articleTagLinkRepository: ArticleTagLinkRepository
  ) {
    this.articleRepository = articleRepository
    this.articleTagRepository = articleTagRepository
    this.articleTagLinkRepository = articleTagLinkRepository
  }

  async create(input: ArticleWrite): Promise<Article> {
    if (await this.getBySlug(input.slug)) {
      throw new ArticleWithSlugAlreadyExistsError()
    }

    return await this.articleRepository.create(input)
  }

  /**
   * Update an article by its id
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const match = await this.articleRepository.getById(id)
    if (match === null) {
      throw new ArticleNotFoundError(id)
    }

    if (input.slug !== match.slug && input.slug && (await this.getBySlug(input.slug))) {
      throw new ArticleWithSlugAlreadyExistsError()
    }

    return await this.articleRepository.update(match.id, input)
  }

  async getAll(page: Pageable): Promise<Article[]> {
    return await this.articleRepository.getAll(page)
  }

  async getAllByTags(tags: ArticleTagName[]): Promise<Article[]> {
    return await this.articleRepository.getByTags(tags)
  }

  async getById(id: ArticleId): Promise<Article | null> {
    return await this.articleRepository.getById(id)
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    return await this.articleRepository.getBySlug(slug)
  }

  async getTags(): Promise<ArticleTag[]> {
    return await this.articleTagRepository.getAll()
  }

  /**
   * Gets the top 10 related articles based on tags
   */
  async getRelated(article: Article): Promise<Article[]> {
    const articleTags = new Set(article.tags)
    const relatedArticles = await this.getAllByTags(article.tags)

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
  }

  /**
   * Add a tag to an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  async addTag(id: ArticleId, tag: ArticleTagName): Promise<void> {
    const match = await this.articleRepository.getById(id)
    if (match === undefined) {
      throw new ArticleNotFoundError(id)
    }
    let name = await this.articleTagRepository.getByName(tag)
    if (name === null) {
      name = await this.articleTagRepository.create(tag)
    }
    return await this.articleTagLinkRepository.add(id, name.name)
  }

  /**
   * Remove a tag from an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  async removeTag(id: ArticleId, tag: ArticleTagName): Promise<void> {
    const match = await this.articleRepository.getById(id)
    if (match === undefined) {
      throw new ArticleNotFoundError(id)
    }
    await this.articleTagLinkRepository.remove(id, tag)
    const articlesWithTag = await this.articleRepository.getByTags([tag])
    const isTagStillInUse = articlesWithTag.length !== 0
    if (!isTagStillInUse) {
      await this.articleTagRepository.delete(tag)
    }
  }

  async setTags(id: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]> {
    const currentTags = (await this.articleTagRepository.getAllByArticle(id)).map((tag) => tag.name)

    const tagsToAdd = tags.filter((tag) => !currentTags.includes(tag))
    const tagsToRemove = currentTags.filter((tag) => !tags.includes(tag))

    const removePromises = tagsToRemove.map(async (tag) => this.removeTag(id, tag))
    const addPromises = tagsToAdd.map(async (tag) => this.addTag(id, tag))

    await Promise.all([...removePromises, ...addPromises])

    return currentTags.filter((tag) => !tagsToRemove.includes(tag)).concat(tagsToAdd)
  }
}
