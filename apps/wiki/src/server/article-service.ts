import { Article, ArticleId, ArticleRepository, ArticleWrite } from "./article-repository"
import { ArticleContentRepository } from "./article-content-repository"

export interface ArticleService {
  getArticleContentById(id: ArticleId): Promise<string>
  createArticle(input: ArticleWrite): Promise<ArticleId>
  findArticle(id: ArticleId): Promise<Article | null>
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
    return await this.articleContentRepository.getArticleContentById(id)
  }

  async createArticle(input: ArticleWrite): Promise<ArticleId> {
    return await this.articleRepository.createArticle(input)
  }

  async findArticle(id: ArticleId): Promise<Article | null> {
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
}
