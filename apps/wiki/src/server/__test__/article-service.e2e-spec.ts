import { describe, it, expect } from "vitest"
import { createServiceLayerForTesting } from "../../../vitest-integration.setup"

describe("article service", () => {
  const core = createServiceLayerForTesting()

  it("should create a new article and find it by id", async () => {
    const id = await core.articleService.createArticle({
      Slug: "/online/historikk",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const article = await core.articleService.findArticle(id)
    expect(article).not.toBeNull()
    expect(article?.Title).toBe("Linjeforeningens Historikk")
    expect(article?.Id).toBe(id)
    expect(article?.ParentId).toBe("<root>")
    expect(article?.Slug).toBe("/online/historikk")
  })

  it("should find many articles", async () => {
    const id1 = await core.articleService.createArticle({
      Slug: "/online/historikk-articles-many",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const id2 = await core.articleService.createArticle({
      Slug: "/online/historikk-articles-many-2",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const articles = await core.articleService.findArticles()
    expect(articles.length).toBeGreaterThanOrEqual(2)
    expect(articles).toContainEqual(expect.objectContaining({ Id: id1 }))
    expect(articles).toContainEqual(expect.objectContaining({ Id: id2 }))
  })

  it("should find an article by its slug", async () => {
    const id = await core.articleService.createArticle({
      Slug: "/online/historikk-articles-by-slug",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const article = await core.articleService.findArticleBySlug("/online/historikk-articles-by-slug")
    expect(article).not.toBeNull()
    expect(article?.Id).toBe(id)
  })

  it("should find articles by parent id", async () => {
    const parentId = await core.articleService.createArticle({
      Slug: "/online/historikk-child",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const id = await core.articleService.createArticle({
      Slug: "/online/historikk-parent",
      ParentId: parentId,
      Title: "Linjeforeningens Historikk",
    })
    const articles = await core.articleService.findArticlesByParent(parentId)
    expect(articles.length).toBe(1)
    expect(articles[0].Id).toBe(id)
  })
})
