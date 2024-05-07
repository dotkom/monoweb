import { env } from "@dotkomonline/env"
import type { S3Repository } from "../external/s3-repository"
import type { AssetRepository } from "./asset-repository"
import type { FileAsset, FileAssetWrite, ImageAssetWrite, ImageAsset, ImageVariationWrite, ImageVariation } from "@dotkomonline/types"

type Fields = Record<string, string>

function encodeS3URI(filename: string): string {
  // Define characters that are generally safe for use in key names
  const safeCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!-_.*'()"

  // Replace unsafe characters with safe ones
  const safeFilename = filename.replace(/[^a-zA-Z0-9!-_.*'()]/g, (match) => {
    // Replace unsafe characters with underscore
    if (!safeCharacters.includes(match)) {
      return "_"
    }
    return match
  })

  // Ensure the key name is not empty
  if (safeFilename.trim() === "") {
    throw new Error("Filename results in an empty key name.")
  }

  return safeFilename
}

export interface PresignedPost {
  url: string
  fields: Fields
  assetKey: string
}

export interface AssetService {
  getFileAsset(key: string): Promise<FileAsset>

  createFileAsset(values: FileAssetWrite): Promise<FileAsset>

  createImageAsset(values: ImageAssetWrite): Promise<ImageAsset>

  createImageVariation(values: ImageVariationWrite): Promise<ImageVariation>
  getImageVariation(id: string): Promise<ImageVariation>
  updateImageVariation(id: string, values: ImageVariationWrite): Promise<ImageVariation>

  createPresignedPost(filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class AssetServiceImpl implements AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly s3Repository: S3Repository
  ) {}

  async getFileAsset(key: string): Promise<FileAsset> {
    return this.assetRepository.getFileAsset(key)
  }

  async createFileAsset(values: FileAssetWrite): Promise<FileAsset> {
    return this.assetRepository.createFileAsset(values)
  }

  async createImageAsset(values: ImageAssetWrite): Promise<ImageAsset> {
    return this.assetRepository.createImageAsset(values)
  }

  async createImageVariation(values: ImageVariationWrite): Promise<ImageVariation> {
    return this.assetRepository.createImageVariation(values)
  }

  async getImageVariation(id: string): Promise<ImageVariation> {
    return this.assetRepository.getImageVariation(id)
  }

  async updateImageVariation(id: string, values: ImageVariationWrite): Promise<ImageVariation> {
    return this.assetRepository.updateImageVariation(id, values)
  }

  async createPresignedPost(filename: string, mimeType: string, maxSizeMB: number) {
    const generatedKey = crypto.randomUUID() + filename
    const encodedKey = encodeS3URI(generatedKey)
    const presignedUrl = await this.s3Repository.createPresignedPost(
      env.STATIC_ASSETS_BUCKET,
      `${encodedKey}`,
      mimeType,
      maxSizeMB
    )

    return {
      ...presignedUrl,
      assetKey: encodedKey,
    }
  }
}
