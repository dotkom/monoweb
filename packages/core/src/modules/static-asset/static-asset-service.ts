import type { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost as _createPresignedPost } from "@aws-sdk/s3-presigned-post"
import type { StaticAsset, StaticAssetId, StaticAssetWrite } from "@dotkomonline/types"
import type { StaticAssetRepository } from "./static-asset-repository"

type Fields = Record<string, string>

export interface PresignedPost {
  url: string
  fields: Fields
}

export interface StaticAssetService {
  get(id: StaticAssetId): Promise<StaticAsset>
  create(payload: StaticAssetWrite): Promise<StaticAsset>
  delete(id: StaticAssetId): Promise<void>
  createPresignedPost(bucket: string, filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class StaticAssetServiceImpl implements StaticAssetService {
  constructor(
    private readonly staticAssetRepository: StaticAssetRepository,
    private readonly s3Client: S3Client
  ) {}

  async createPresignedPost(
    bucket: string,
    filepath: string,
    mimeType: string,
    maxSizeMB: number
  ): Promise<PresignedPost> {
    return await _createPresignedPost(this.s3Client, {
      Bucket: bucket,
      Key: filepath,
      Fields: {
        "content-type": mimeType,
      },
      Conditions: [["content-length-range", 0, maxSizeMB * 1024 * 1024]],
    })
  }

  async handlePresignedPostSuccess(write: StaticAssetWrite): Promise<StaticAsset> {
    return this.staticAssetRepository.create(write)
  }

  async create(payload: StaticAssetWrite): Promise<StaticAsset> {
    const staticAsset = await this.staticAssetRepository.create(payload)
    return staticAsset
  }

  async get(id: StaticAssetId): Promise<StaticAsset> {
    return this.staticAssetRepository.get(id)
  }

  async delete(id: StaticAssetId): Promise<void> {
    await this.staticAssetRepository.delete(id)
  }
}
