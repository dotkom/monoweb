import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import { ArticleNotFoundError } from "./article-error"
import type { ArticleRepository } from "./article-repository"
import type { ArticleTagLinkRepository } from "./article-tag-link-repository"
import type { ArticleTagRepository } from "./article-tag-repository"

export interface ArticleService {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(take: number, cursor?: Cursor): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | undefined>
  getBySlug(slug: ArticleSlug): Promise<Article | undefined>

  getTags(take: number, cursor?: Cursor): Promise<ArticleTag[]>
  addTag(id: ArticleId, tag: ArticleTagName): Promise<void>
  removeTag(id: ArticleId, tag: ArticleTagName): Promise<void>
}

export class ArticleServiceImpl implements ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleTagRepository: ArticleTagRepository,
    private readonly articleTagLinkRepository: ArticleTagLinkRepository
  ) {}

  async create(input: ArticleWrite): Promise<Article> {
    return await this.articleRepository.create(input)
  }

  /**
   * Update an article by its id
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const match = await this.articleRepository.getById(id)
    if (match === undefined) {
      throw new ArticleNotFoundError(id)
    }
    return await this.articleRepository.update(match.id, input)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Article[]> {
    return await this.articleRepository.getAll(take, cursor)
  }

  async getById(id: ArticleId): Promise<Article | undefined> {
    return await this.articleRepository.getById(id)
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | undefined> {
    return await this.articleRepository.getBySlug(slug)
  }

  async getTags(take: number, cursor?: Cursor): Promise<ArticleTag[]> {
    return await this.articleTagRepository.getAll(take, cursor)
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
    if (name === undefined) {
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
    const articlesWithTag = await this.articleRepository.getByTags([tag], 1)
    const isTagStillInUse = articlesWithTag.length !== 0
    if (!isTagStillInUse) {
      await this.articleTagRepository.delete(tag)
    }
  }
}
