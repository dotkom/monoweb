import { ArticleRepository } from "./article-repository"
import { ArticleContentRepository } from "./article-content-repository"
import { Article, ArticleId, ArticleWrite, Attachment } from "./types"
import { ArticleNotFoundError } from "./error"

export interface ArticleService {
  getArticleContentById(id: ArticleId): Promise<string>
  putArticleContentById(id: ArticleId, content: string): Promise<void>
  createAttachment(): Promise<Attachment>
  createArticle(input: ArticleWrite): Promise<ArticleId>
  findArticleById(id: ArticleId): Promise<Article | null>
  findArticleBySlug(id: string): Promise<Article | null>
  findArticles(): Promise<Article[]>
  findArticlesByParent(parentId: string): Promise<Article[]>
}

export class ArticleServiceImpl implements ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleContentRepository: ArticleContentRepository
  ) {}

  async getArticleContentById(id: ArticleId): Promise<string> {
    const article = await this.findArticleById(id)
    if (article === null) {
      throw new ArticleNotFoundError(id)
    }
    return await this.articleContentRepository.getArticleContentById(article.Id)
  }

  async putArticleContentById(id: ArticleId, content: string): Promise<void> {
    const article = await this.findArticleById(id)
    if (article === null) {
      throw new ArticleNotFoundError(id)
    }
    await this.articleContentRepository.putArticleContentById(article.Id, content)
  }

  async createArticle(input: ArticleWrite): Promise<ArticleId> {
    return await this.articleRepository.createArticle(input)
  }

  async findArticleById(id: ArticleId): Promise<Article | null> {
    return await this.articleRepository.findArticle(id)
  }

  async findArticleBySlug(slug: string): Promise<Article | null> {
    return await this.articleRepository.findArticleBySlug(slug)
  }

  async findArticles(): Promise<Article[]> {
    return await this.articleRepository.findArticles()
  }

  async findArticlesByParent(parentId: ArticleId): Promise<Article[]> {
    return await this.articleRepository.findArticlesByParent(parentId)
  }

  async createAttachment(): Promise<Attachment> {
    return await this.articleContentRepository.createAttachment()
  }
}
