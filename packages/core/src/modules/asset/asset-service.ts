import type { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost as _createPresignedPost } from "@aws-sdk/s3-presigned-post"
import type { Asset, AssetId, AssetWrite, Image, ImageWrite } from "@dotkomonline/types"
import type { AssetRepository } from "./asset-repository"

type Fields = Record<string, string>

export interface PresignedPost {
  url: string
  fields: Fields
}

export interface AssetService {
  get(id: AssetId): Promise<Asset>
  create(payload: AssetWrite): Promise<Asset>
  createPresignedPost(bucket: string, filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
  createImage(payload: ImageWrite): Promise<Image>
}

export class AssetServiceImpl implements AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly s3Client: S3Client
  ) {}

  async createImage(payload: ImageWrite) {
    return this.assetRepository.createImage(payload)
  }

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

  async handlePresignedPostSuccess(write: AssetWrite): Promise<Asset> {
    return this.assetRepository.create(write)
  }

  async create(payload: AssetWrite): Promise<Asset> {
    const staticAsset = await this.assetRepository.create(payload)
    return staticAsset
  }

  async get(id: AssetId): Promise<Asset> {
    return this.assetRepository.get(id)
  }
}
