import { env } from "@dotkomonline/env"
import type { Asset, AssetKey, AssetWrite, Image, ImageWrite } from "@dotkomonline/types"
import type { S3Repository } from "../external/s3-repository"
import type { AssetRepository } from "./asset-repository"

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
  get(key: AssetKey): Promise<Asset>
  getImage(id: string): Promise<Image>
  create(payload: AssetWrite): Promise<Asset>
  createPresignedPost(filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
  createImage(payload: ImageWrite): Promise<Image>
  updateImage(id: string, payload: ImageWrite): Promise<Image>
}

export class AssetServiceImpl implements AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly s3Repository: S3Repository
  ) {}

  async getImage(id: string): Promise<Image> {
    return this.assetRepository.getImage(id)
  }

  async updateImage(id: string, payload: ImageWrite) {
    return this.assetRepository.updateImage(id, payload)
  }

  async createImage(payload: ImageWrite) {
    return this.assetRepository.createImage(payload)
  }

  async createPresignedPost(filename: string, mimeType: string, maxSizeMB: number) {
    const generatedKey = crypto.randomUUID() + filename
    const encodedKey = encodeS3URI(generatedKey)
    const presignedUrl = await this.s3Repository.createPresignedPost(
      env.S3_BUCKET_MONOWEB,
      `testing/${encodedKey}`,
      mimeType,
      maxSizeMB
    )

    return {
      ...presignedUrl,
      assetKey: encodedKey,
    }
  }

  async handlePresignedPostSuccess(write: AssetWrite): Promise<Asset> {
    return this.assetRepository.create(write)
  }

  async create(payload: AssetWrite): Promise<Asset> {
    const staticAsset = await this.assetRepository.create(payload)
    return staticAsset
  }

  async get(key: AssetKey): Promise<Asset> {
    return this.assetRepository.get(key)
  }
}
