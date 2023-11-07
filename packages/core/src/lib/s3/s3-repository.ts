import { type PresignedPost, createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { S3Client } from "@aws-sdk/client-s3"
import { env } from "@dotkomonline/env"

export interface S3Repository {
  getPresignedPostData(bucket: string, filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class s3RepositoryImpl implements S3Repository {
  async getPresignedPostData(
    bucket: string,
    filepath: string,
    mimeType: string,
    maxSizeMB: number
  ): Promise<PresignedPost> {
    const s3 = new S3Client({
      region: env.AWS_REGION,
    })

    return await createPresignedPost(s3, {
      Bucket: bucket,
      Key: filepath,
      Fields: {
        "content-type": mimeType,
      },
      Conditions: [["content-length-range", 0, maxSizeMB * 1024 * 1024]],
    })
  }
}
