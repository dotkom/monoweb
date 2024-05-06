import { env } from "@dotkomonline/env"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import type { S3Repository } from "../external/s3-repository"
import { OfflineNotFoundError } from "./offline-error"
import type { OfflineRepository } from "./offline-repository"

type Fields = Record<string, string>

export interface PresignedPost {
  url: string
  fields: Fields
}

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

export interface OfflineService {
  get(id: OfflineId): Promise<Offline>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(payload: OfflineWrite): Promise<Offline>
  update(id: OfflineId, payload: Partial<OfflineWrite>): Promise<Offline>
  createPresignedPost(
    filename: string,
    mimeType: string
  ): Promise<{
    presignedUrl: PresignedPost
    s3Key: string
  }>
}

export class OfflineServiceImpl implements OfflineService {
  constructor(
    private readonly offlineRepository: OfflineRepository,
    private readonly s3Repository: S3Repository
  ) {}

  async get(id: OfflineId) {
    const offline = await this.offlineRepository.getById(id)
    if (offline === null) {
      throw new OfflineNotFoundError(id)
    }
    return offline
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const offlines = await this.offlineRepository.getAll(take, cursor)
    return offlines
  }

  async create(payload: OfflineWrite): Promise<Offline> {
    const offline = await this.offlineRepository.create(payload)
    return offline
  }

  async update(id: OfflineId, payload: Partial<OfflineWrite>): Promise<Offline> {
    const offline = await this.offlineRepository.update(id, payload)
    return offline
  }

  async createPresignedPost(filename: string, mimeType: string) {
    const generatedKey = crypto.randomUUID() + filename
    const encodedKey = encodeS3URI(generatedKey)
    console.log("Generated asset key", encodedKey)
    const presignedUrl = await this.s3Repository.createPresignedPost(
      env.S3_BUCKET_MONOWEB,
      `testing/${encodedKey}`,
      mimeType,
      60
    ) // 60 MB file limit

    return {
      presignedUrl,
      s3Key: encodedKey,
    }
  }
}
