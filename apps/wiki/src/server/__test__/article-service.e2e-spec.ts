import { describe, it, expect } from "vitest"
import { createServiceLayerForTesting, s3BucketName, s3Client } from "../../../vitest-integration.setup"
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

describe("article service", () => {
  const core = createServiceLayerForTesting()

  it("should create a new article and find it by id", async () => {
    const id = await core.articleService.createArticle({
      Slug: "/online/historikk",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    const article = await core.articleService.findArticleById(id)
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

  it("should be able to set the content of an article", async () => {
    const id = await core.articleService.createArticle({
      Slug: "/online/historikk-content",
      ParentId: "<root>",
      Title: "Linjeforeningens Historikk",
    })
    await core.articleService.putArticleContentById(id, JSON.stringify({ this: "is a json value" }))
    const content = await core.articleService.getArticleContentById(id)
    expect(content).toBe(JSON.stringify({ this: "is a json value" }))
    // Clean up the article
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: s3BucketName,
        Key: id,
      })
    )
  }, 30000)

  it("should be able to create an attachment", async () => {
    const attachment = await core.articleService.createAttachment()
    expect(attachment).toMatchObject({
      key: expect.any(String),
      url: expect.any(String),
    })
    // Forge a fake SVG file to upload to the S3 bucket
    const body = new Blob(["<svg></svg>"], { type: "image/svg+xml" })
    const formData = new FormData()
    for (const [key, value] of Object.entries(attachment.fields)) {
      formData.append(key, value)
    }
    formData.append("file", body)
    const response = await fetch(attachment.url, {
      method: "POST",
      body: formData,
    })
    // Ensure the file was actually uploaded
    expect(response.status).toBe(204)
    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3BucketName,
        Key: attachment.key,
      })
    )
    expect(object.ContentType).toBe("binary/octet-stream")
    expect(object.Body?.transformToString()).resolves.toBe("<svg></svg>")
    // Clean up the attachment
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: s3BucketName,
        Key: attachment.key,
      })
    )
  })
})
