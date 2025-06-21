import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { S3Repository } from "../external/s3-repository"
import { OfflineNotFoundError } from "./offline-error"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  /**
   * Get an offline by its id
   *
   * @throws {OfflineNotFoundError} if the offline does not exist
   */
  getById(offlineId: OfflineId): Promise<Offline>
  getAll(page: Pageable): Promise<Offline[]>
  create(data: OfflineWrite): Promise<Offline>
  update(offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
  createPresignedPost(filename: string, mimeType: string): Promise<PresignedPost>
}

export class OfflineServiceImpl implements OfflineService {
  private readonly offlineRepository: OfflineRepository
  private readonly s3Repository: S3Repository

  constructor(offlineRepository: OfflineRepository, s3Repository: S3Repository) {
    this.offlineRepository = offlineRepository
    this.s3Repository = s3Repository
  }

  public async getById(id: OfflineId) {
    const offline = await this.offlineRepository.getById(id)
    if (!offline) {
      throw new OfflineNotFoundError(id)
    }
    return offline
  }

  public async getAll(page: Pageable) {
    return this.offlineRepository.getAll(page)
  }

  public async create(payload: OfflineWrite) {
    return this.offlineRepository.create(payload)
  }

  public async update(id: OfflineId, payload: Partial<OfflineWrite>) {
    return this.offlineRepository.update(id, payload)
  }

  public async createPresignedPost(filename: string, mimeType: string) {
    const uuid = crypto.randomUUID()
    const key = `${Date.now()}-${uuid}-${filename}`
    const maxSizeMB = 25 // Kind of arbitrary, but this is gmail max size for attachments so I figured its a sane max size.

    return this.s3Repository.createPresignedPost(key, mimeType, maxSizeMB)
  }
}
