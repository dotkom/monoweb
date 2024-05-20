import { env } from "@dotkomonline/env"
import type {
  FileAsset,
  FileAssetUpdate,
  FileAssetWrite,
  ImageAsset,
  ImageAssetUpdate,
  ImageAssetWrite,
  ImageVariant,
  ImageVariantWrite,
} from "@dotkomonline/types"
import type { S3Repository } from "../external/s3-repository"
import type { AssetRepository } from "./asset-repository"
import type { Collection, Pageable } from "../../utils/cursor-pagination/types"

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
  createFileAsset(values: FileAssetWrite): Promise<FileAsset>
  updateFileAsset(id: string, values: FileAssetUpdate): Promise<FileAsset>

  createImageAsset(values: ImageAssetWrite): Promise<ImageAsset>
  updateImageAsset(id: string, values: ImageAssetUpdate): Promise<ImageAsset>

  createImageVariation(values: ImageVariantWrite): Promise<ImageVariant>
  updateImageVariation(id: string, values: ImageVariantWrite): Promise<ImageVariant>

  createPresignedPost(filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>

  getAllFileAssets(pageable: Pageable): Promise<Collection<FileAsset>>
  getAllImageAssets(pageable: Pageable): Promise<Collection<ImageAsset>>
}

export class AssetServiceImpl implements AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly s3Repository: S3Repository
  ) {}

  async getAllFileAssets(pageable: Pageable) {
    return this.assetRepository.getAllFileAssets(pageable)
  }

  async getAllImageAssets(pageable: Pageable) {
    return this.assetRepository.getAllImageAssets(pageable)
  }

  async createFileAsset(values: FileAssetWrite): Promise<FileAsset> {
    return this.assetRepository.createFileAsset(values)
  }

  async updateFileAsset(id: string, values: FileAssetUpdate): Promise<FileAsset> {
    return this.assetRepository.updateFileAsset(id, values)
  }

  async createImageAsset(values: ImageAssetWrite): Promise<ImageAsset> {
    return this.assetRepository.createImageAsset(values)
  }

  async updateImageAsset(id: string, values: ImageAssetUpdate): Promise<ImageAsset> {
    return this.assetRepository.updateImageAsset(id, values)
  }

  async createImageVariation(values: ImageVariantWrite): Promise<ImageVariant> {
    return this.assetRepository.createImageVariation(values)
  }

  async updateImageVariation(id: string, values: ImageVariantWrite): Promise<ImageVariant> {
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
