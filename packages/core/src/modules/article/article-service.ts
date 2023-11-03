import {
  type Article,
  type ArticleId,
  type ArticleSlug,
  type ArticleTag,
  type ArticleTagName,
  type ArticleWrite,
} from "@dotkomonline/types"
import { type ArticleRepository } from "./article-repository"
import { type ArticleTagRepository } from "./article-tag-repository"
import { type ArticleTagLinkRepository } from "./article-tag-link-repository"
import { type Cursor } from "../../utils/db-utils"

export interface ArticleService {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(take: number, cursor?: Cursor): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | undefined>
  getBySlug(slug: ArticleSlug): Promise<Article | undefined>

  getAllTags(take: number, cursor?: Cursor): Promise<ArticleTag[]>

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
  }

  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
  }
}
