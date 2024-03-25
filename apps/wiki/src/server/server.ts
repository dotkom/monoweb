"use server"

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { ArticleRepository, ArticleRepositoryImpl } from "./article-repository"
import { S3Client } from "@aws-sdk/client-s3"
import { ArticleContentRepository, ArticleContentRepositoryImpl } from "./article-content-repository"
import { ArticleService, ArticleServiceImpl } from "./article-service"

export type ServiceLayer = ReturnType<typeof createServiceLayer>

export interface ServerLayerOptions {
  dynamoTableName: string
  s3BucketName: string
}

export const createServiceLayer = ({ dynamoTableName, s3BucketName }: ServerLayerOptions) => {
  const dynamoDbClient = new DynamoDBClient({})
  const s3Client = new S3Client({})
  const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
  const articleRepository: ArticleRepository = new ArticleRepositoryImpl(dynamoDbDocumentClient, dynamoTableName)
  const articleContentRepository: ArticleContentRepository = new ArticleContentRepositoryImpl(s3Client, s3BucketName)
  const articleService: ArticleService = new ArticleServiceImpl(articleRepository, articleContentRepository)
  return {
    articleService,
  }
}
