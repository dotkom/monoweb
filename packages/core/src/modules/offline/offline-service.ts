import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { S3Repository } from "../external/s3-repository"
import { OfflineNotFoundError } from "./offline-error"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  get(id: OfflineId): Promise<Offline | null>
  getAll(page: Pageable): Promise<Offline[]>
  create(payload: OfflineWrite): Promise<Offline>
  update(id: OfflineId, payload: Partial<OfflineWrite>): Promise<Offline>
  createPresignedPost(filename: string, mimeType: string): Promise<PresignedPost>
}

export class OfflineServiceImpl implements OfflineService {
  constructor(
    private readonly offlineRepository: OfflineRepository,
    private readonly s3Repository: S3Repository
  ) {}

  /**
   * Get an offline by its id
   *
   * @throws {OfflineNotFoundError} if the offline does not exist
   */
  async get(id: OfflineId): Promise<Offline | null> {
    const offline = await this.offlineRepository.getById(id)
    if (offline === undefined) {
      throw new OfflineNotFoundError(id)
    }
    return offline
  }

  async getAll(page: Pageable): Promise<Offline[]> {
    return this.offlineRepository.getAll(page)
  }

  async create(payload: OfflineWrite): Promise<Offline> {
    return this.offlineRepository.create(payload)
  }

  async update(id: OfflineId, payload: Partial<OfflineWrite>): Promise<Offline> {
    return this.offlineRepository.update(id, payload)
  }

  async createPresignedPost(filename: string, mimeType: string): Promise<PresignedPost> {
    const uuid = crypto.randomUUID()
    const key = `${Date.now()}-${uuid}-${filename}`
    const maxSizeMB = 25 // Kind of arbitrary, but this is gmail max size for attachments so I figured its a sane max size.

    return this.s3Repository.createPresignedPost(key, mimeType, maxSizeMB)
  }
}
