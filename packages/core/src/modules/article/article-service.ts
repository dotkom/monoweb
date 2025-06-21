import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { compareAsc, compareDesc } from "date-fns"
import type { Pageable } from "../../query"
import { ArticleNotFoundError, ArticleWithSlugAlreadyExistsError } from "./article-error"
import type { ArticleRepository } from "./article-repository"
import type { ArticleTagLinkRepository } from "./article-tag-link-repository"
import type { ArticleTagRepository } from "./article-tag-repository"

export interface ArticleService {
  create(input: ArticleWrite): Promise<Article>
  /**
   * Update an article by its id
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  update(articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(page: Pageable): Promise<Article[]>
  getAllByTags(tags: ArticleTagName[]): Promise<Article[]>
  getById(articleId: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  /**
   * Gets the top 10 related articles based on tags
   */
  getRelated(article: Article): Promise<Article[]>
  getFeatured(): Promise<Article[]>
  getTags(): Promise<ArticleTag[]>
  /**
   * Add a tag to an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  addTag(articleId: ArticleId, tag: ArticleTagName): Promise<void>
  /**
   * Remove a tag from an article
   *
   * @throws {ArticleNotFoundError} if the article does not exist
   */
  removeTag(articleId: ArticleId, tag: ArticleTagName): Promise<void>
  setTags(articleId: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]>
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

  public async create(input: ArticleWrite): Promise<Article> {
    if (await this.getBySlug(input.slug)) {
      throw new ArticleWithSlugAlreadyExistsError()
    }

    return await this.articleRepository.create(input)
  }

  public async update(articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const match = await this.articleRepository.getById(articleId)
    if (match === null) {
      throw new ArticleNotFoundError(articleId)
    }

    if (input.slug !== match.slug && input.slug && (await this.getBySlug(input.slug))) {
      throw new ArticleWithSlugAlreadyExistsError()
    }

    return await this.articleRepository.update(match.id, input)
  }

  public async getAll(page: Pageable): Promise<Article[]> {
    return await this.articleRepository.getAll(page)
  }

  public async getAllByTags(tags: ArticleTagName[]): Promise<Article[]> {
    return await this.articleRepository.getByTags(tags)
  }

  public async getById(articleId: ArticleId): Promise<Article | null> {
    return await this.articleRepository.getById(articleId)
  }

  public async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    return await this.articleRepository.getBySlug(slug)
  }

  public async getTags(): Promise<ArticleTag[]> {
    return await this.articleTagRepository.getAll()
  }

  public async getRelated(article: Article): Promise<Article[]> {
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

  public async getFeatured(): Promise<Article[]> {
    const articles = await this.articleRepository.getFeatured()
    return articles.sort((a, b) => compareDesc(a.updatedAt, b.updatedAt))
  }

  public async addTag(articleId: ArticleId, tag: ArticleTagName): Promise<void> {
    const match = await this.articleRepository.getById(articleId)
    if (!match) {
      throw new ArticleNotFoundError(articleId)
    }
    let name = await this.articleTagRepository.getByName(tag)
    if (name === null) {
      name = await this.articleTagRepository.create(tag)
    }
    return await this.articleTagLinkRepository.add(articleId, name.name)
  }

  public async removeTag(articleId: ArticleId, tag: ArticleTagName): Promise<void> {
    const match = await this.articleRepository.getById(articleId)
    if (!match) {
      throw new ArticleNotFoundError(articleId)
    }
    await this.articleTagLinkRepository.remove(articleId, tag)
    const articlesWithTag = await this.articleRepository.getByTags([tag])
    const isTagStillInUse = articlesWithTag.length !== 0
    if (!isTagStillInUse) {
      await this.articleTagRepository.delete(tag)
    }
  }

  public async setTags(articleId: ArticleId, tags: ArticleTagName[]): Promise<ArticleTagName[]> {
    const currentTags = (await this.articleTagRepository.getAllByArticle(articleId)).map((tag) => tag.name)

    const tagsToAdd = tags.filter((tag) => !currentTags.includes(tag))
    const tagsToRemove = currentTags.filter((tag) => !tags.includes(tag))

    const removePromises = tagsToRemove.map(async (tag) => this.removeTag(articleId, tag))
    const addPromises = tagsToAdd.map(async (tag) => this.addTag(articleId, tag))

    await Promise.all([...removePromises, ...addPromises])

    return currentTags.filter((tag) => !tagsToRemove.includes(tag)).concat(tagsToAdd)
  }
}
