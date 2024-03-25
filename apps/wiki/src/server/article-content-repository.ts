import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"

import { ArticleId } from "./types"

export interface ArticleContentRepository {
  getArticleContentById(id: ArticleId): Promise<string>
}

export class ArticleContentRepositoryImpl implements ArticleContentRepository {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string
  ) {}

  async getArticleContentById(id: ArticleId): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: id,
    })
    const response = await this.s3Client.send(command)
    return (await response.Body?.transformToString("utf-8")) ?? ""
  }
}
