import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"

import { ArticleId, Attachment, AttachmentSchema } from "./types"

export interface ArticleContentRepository {
  getArticleContentById(id: ArticleId): Promise<string>
  putArticleContentById(id: ArticleId, content: string): Promise<void>
  createAttachment(): Promise<Attachment>
  existsById(id: ArticleId): Promise<boolean>
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
    try {
      const response = await this.s3Client.send(command)
      const body = await response.Body?.transformToString("utf-8")
      return body ?? ""
    } catch (error) {
      console.error(error)
      return ""
    }
  }

  async existsById(id: ArticleId): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: id,
    })
    try {
      await this.s3Client.send(command)
      return true
    } catch (error) {
      if ((error as { name: string }).name === "NotFound") {
        return false
      }
      throw error
    }
  }

  async putArticleContentById(id: ArticleId, content: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: id,
      Body: content,
    })
    await this.s3Client.send(command)
  }

  async createAttachment(): Promise<Attachment> {
    const key = `/attachments/${crypto.randomUUID()}`
    const response = await createPresignedPost(this.s3Client, {
      Key: key,
      Bucket: this.bucketName,
      Conditions: [["content-length-range", 0, 1024 * 1024 * 25]],
      Expires: 60,
    })
    return AttachmentSchema.parse({
      key,
      url: response.url,
      fields: response.fields,
    })
  }
}
