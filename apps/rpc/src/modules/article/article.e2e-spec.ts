import * as crypto from "node:crypto"
import type { ArticleWrite } from "@dotkomonline/types"
import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { dbClient } from "../../../vitest-integration.setup"
import { AlreadyExistsError, NotFoundError } from "../../error"
import { getArticleRepository } from "./article-repository"
import { getArticleService } from "./article-service"
import { getArticleTagLinkRepository } from "./article-tag-link-repository"
import { getArticleTagRepository } from "./article-tag-repository"

function getMockArticle(input: Partial<ArticleWrite> = {}): ArticleWrite {
  return {
    title: faker.book.title(),
    author: faker.book.author(),
    photographer: faker.person.fullName(),
    imageUrl: faker.image.url(),
    slug: faker.lorem.slug(),
    excerpt: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    isFeatured: false,
    vimeoId: null,
    ...input,
  }
}

describe("article integration tests", () => {
  const articleRepository = getArticleRepository()
  const articleTagRepository = getArticleTagRepository()
  const articleTagLinkRepository = getArticleTagLinkRepository()
  const articleService = getArticleService(articleRepository, articleTagRepository, articleTagLinkRepository)

  it("should create a new article if the slug does not exist", async () => {
    const mock = getMockArticle()
    const article = await articleService.create(dbClient, mock)
    expect(article.title).toBe(mock.title)
    // It should not allow creating an article with the same slug
    const duplicate = getMockArticle({ slug: mock.slug })
    await expect(articleService.create(dbClient, duplicate)).rejects.toThrow(AlreadyExistsError)
  })

  it("should update an existing article if the slug is not used", async () => {
    // An unknown article cannot be updated
    await expect(articleService.update(dbClient, crypto.randomUUID(), {})).rejects.toThrow(NotFoundError)
    const mock = getMockArticle()
    const article = await articleService.create(dbClient, mock)
    // It should be all good to change this to a new slug
    const newSlug = faker.lorem.slug()
    expect(article.slug).not.toBe(newSlug)
    const updated = await articleService.update(dbClient, article.id, { slug: newSlug })
    expect(updated.slug).toBe(newSlug)
    // But it should not be possible to update a new article to that slug
    const beta = await articleService.create(dbClient, getMockArticle())
    await expect(articleService.update(dbClient, beta.id, { slug: newSlug })).rejects.toThrow(AlreadyExistsError)
  })

  it("should find an article by several criteria", async () => {
    const article = await articleService.create(dbClient, getMockArticle())
    const byId = await articleService.getById(dbClient, article.id)
    expect(byId).not.toBeNull()
    expect(byId?.id).toBe(article.id)
    const bySlug = await articleService.getBySlug(dbClient, article.slug)
    expect(bySlug).not.toBeNull()
    expect(bySlug?.id).toBe(article.id)
    const byAll = await articleService.getAll(dbClient, { take: 10 })
    expect(byAll).toContainEqual(expect.objectContaining({ id: article.id }))
  })

  it("should be able to set tags on an article", async () => {
    const article = await articleService.create(dbClient, getMockArticle())
    const tag1 = faker.lorem.word()
    await articleService.addTag(dbClient, article.id, tag1)
    const articleWithTag1 = await articleService.getById(dbClient, article.id)
    expect(articleWithTag1?.tags).toContainEqual(expect.objectContaining({ name: tag1 }))
    // It should now be able to find the article by tag
    const articlesByTag1 = await articleService.getAllByTags(dbClient, [tag1])
    expect(articlesByTag1).toContainEqual(expect.objectContaining({ id: article.id }))
    // Removing the tag should make it no longer findable by tag
    await articleService.removeTag(dbClient, article.id, tag1)
    const articleWithoutTag1 = await articleService.getById(dbClient, article.id)
    expect(articleWithoutTag1?.tags).not.toContainEqual(expect.objectContaining({ name: tag1 }))
  })

  it("should throw an error when trying to modifying tags of a non-existing article", async () => {
    const nonExistingArticleId = crypto.randomUUID()
    const tag = faker.lorem.word()
    await expect(articleService.addTag(dbClient, nonExistingArticleId, tag)).rejects.toThrow(NotFoundError)
    await expect(articleService.removeTag(dbClient, nonExistingArticleId, tag)).rejects.toThrow(NotFoundError)
    await expect(articleService.setTags(dbClient, nonExistingArticleId, [tag])).rejects.toThrow(NotFoundError)
  })

  it("should be able to find a featured article", async () => {
    const article = await articleService.create(dbClient, getMockArticle({ isFeatured: true }))
    const featured = await articleService.getFeatured(dbClient)
    expect(featured).toContainEqual(expect.objectContaining({ id: article.id }))
  })

  it("should find related articles by the same tag", async () => {
    const tag = faker.lorem.word()
    const alpha = await articleService.create(dbClient, getMockArticle())
    await articleService.addTag(dbClient, alpha.id, tag)
    const beta = await articleService.create(dbClient, getMockArticle())
    await articleService.addTag(dbClient, beta.id, tag)
    // Alpha and beta are now related by tags
    const alphaWithTags = await articleService.getById(dbClient, alpha.id)
    expect(alphaWithTags).not.toBeNull()
    // biome-ignore lint/style/noNonNullAssertion: this has been asserted to not be null
    const related = await articleService.getRelated(dbClient, alphaWithTags!)
    expect(related).toHaveLength(1)
    expect(related).toContainEqual(expect.objectContaining({ id: beta.id }))
  })
})
