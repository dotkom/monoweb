import type { S3Client } from "@aws-sdk/client-s3"
import { type PresignedPost, createPresignedPost as _createPresignedPost } from "@aws-sdk/s3-presigned-post"

export interface S3Repository {
  createPresignedPost(bucket: string, filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class S3RepositoryImpl implements S3Repository {
  public constructor(private readonly s3Client: S3Client) {}

  async createPresignedPost(
    bucket: string,
    filepath: string,
    mimeType: string,
    maxSizeMB: number
  ): Promise<PresignedPost> {
    console.log("Creating presigned post for", bucket, filepath, mimeType, maxSizeMB)
    return await _createPresignedPost(this.s3Client, {
      Bucket: bucket,
      Key: filepath,
      Fields: {
        "content-type": mimeType,
      },
      Conditions: [["content-length-range", 0, maxSizeMB * 1024 * 1024]],
    })
  }
}
