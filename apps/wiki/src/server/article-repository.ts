"use server"

import { z } from "zod"
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"

export type Article = z.infer<typeof ArticleSchema>
export type ArticleId = Article["Id"]
export const ArticleSchema = z.object({
  Id: z.string().uuid(),
  ParentId: z.string().uuid().or(z.literal("<root>")),
  Slug: z.string().min(1),
  Title: z.string().min(1),
})

export type ArticleWrite = z.infer<typeof ArticleWriteSchema>
const ArticleWriteSchema = ArticleSchema.omit({ Id: true })

export interface ArticleRepository {
  createArticle(input: ArticleWrite): Promise<ArticleId>
  findArticle(id: ArticleId): Promise<Article | null>
  findArticleBySlug(id: string): Promise<Article | null>
  findArticles(): Promise<Article[]>
  findArticlesByParent(parentId: ArticleId): Promise<Article[]>
}

export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(
    private readonly dynamoDbClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async createArticle(input: ArticleWrite): Promise<ArticleId> {
    const id = crypto.randomUUID()
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...input,
        Id: id,
      },
    })
    await this.dynamoDbClient.send(command)
    return id
  }

  async findArticle(id: ArticleId): Promise<Article | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "Id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      },
    })
    const output = await this.dynamoDbClient.send(command)
    if (output.Count !== undefined && output.Count > 1) {
      throw new Error("More than one article found with the same id")
    }
    return output.Items?.[0] ? ArticleSchema.parse(output.Items[0]) : null
  }

  async findArticleBySlug(slug: string): Promise<Article | null> {
    const command = new ScanCommand({
      TableName: this.tableName,
      IndexName: "Slug",
      FilterExpression: "Slug = :slug",
      ExpressionAttributeValues: {
        ":slug": slug,
      },
    })
    const output = await this.dynamoDbClient.send(command)
    if (output.Count !== undefined && output.Count > 1) {
      throw new Error("More than one article found with the same slug")
    }
    return output.Items?.[0] ? ArticleSchema.parse(output.Items[0]) : null
  }

  async findArticles(): Promise<Article[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    })
    const output = await this.dynamoDbClient.send(command)
    return output.Items?.map((item) => ArticleSchema.parse(item)) ?? []
  }

  async findArticlesByParent(parentId: string): Promise<Article[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      IndexName: "ParentId",
      FilterExpression: "ParentId = :parentId",
      ExpressionAttributeValues: {
        ":parentId": parentId,
      },
    })
    const output = await this.dynamoDbClient.send(command)
    return output.Items?.map((item) => ArticleSchema.parse(item)) ?? []
  }
}
