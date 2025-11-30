import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite, UserId } from "@dotkomonline/types"
import { createS3PresignedPost, slugify } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  create(handle: DBHandle, data: OfflineWrite): Promise<Offline>
  update(handle: DBHandle, offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
  findById(handle: DBHandle, offlineId: OfflineId): Promise<Offline | null>
  /**
   * Get an offline by its id
   *
   * @throws {NotFoundError} if the offline does not exist
   */
  getById(handle: DBHandle, offlineId: OfflineId): Promise<Offline>
  findMany(handle: DBHandle, page: Pageable): Promise<Offline[]>

  createFileUpload(
    handle: DBHandle,
    filename: string,
    contentType: string,
    createdByUserId: UserId
  ): Promise<PresignedPost>
}

export function getOfflineService(
  offlineRepository: OfflineRepository,
  s3Client: S3Client,
  s3BucketName: string
): OfflineService {
  return {
    async create(handle, data) {
      return offlineRepository.create(handle, data)
    },

    async update(handle, id, data) {
      return offlineRepository.update(handle, id, data)
    },

    async findById(handle, id) {
      return offlineRepository.findById(handle, id)
    },

    async getById(handle, id) {
      const offline = await this.findById(handle, id)
      if (!offline) {
        throw new NotFoundError(`Offline(ID=${id}) not found`)
      }
      return offline
    },

    async findMany(handle, page) {
      return offlineRepository.findMany(handle, page)
    },

    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `offlines/${Date.now()}-${uuid}-${slugify(filename)}`

      const maxSizeKiB = 50 * 1024 // 50 MiB

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB,
        contentType,
        createdByUserId,
      })
    },
  }
}
