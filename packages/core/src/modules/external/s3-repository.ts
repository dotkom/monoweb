import type { S3Client } from "@aws-sdk/client-s3"
import { type PresignedPost, createPresignedPost as _createPresignedPost } from "@aws-sdk/s3-presigned-post"

export interface S3Repository {
  createPresignedPost(key: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class S3RepositoryImpl implements S3Repository {
  public constructor(
    private readonly s3Client: S3Client,
    private readonly s3BucketName: string
  ) {}

  async createPresignedPost(key: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost> {
    return _createPresignedPost(this.s3Client, {
      Bucket: this.s3BucketName,
      Key: key,
      Fields: {
        "content-type": mimeType,
      },
      Conditions: [["content-length-range", 0, maxSizeMB * 1024 * 1024]],
    })
  }
}
