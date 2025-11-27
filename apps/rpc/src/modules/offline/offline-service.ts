import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite, UserId } from "@dotkomonline/types"
import { createS3PresignedPost } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  /**
   * Get an offline by its id
   *
   * @throws {NotFoundError} if the offline does not exist
   */
  getById(handle: DBHandle, offlineId: OfflineId): Promise<Offline>
  getAll(handle: DBHandle, page: Pageable): Promise<Offline[]>
  create(handle: DBHandle, data: OfflineWrite): Promise<Offline>
  update(handle: DBHandle, offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
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
    async getById(handle, id) {
      const offline = await offlineRepository.getById(handle, id)
      if (!offline) {
        throw new NotFoundError(`Offline(ID=${id}) not found`)
      }
      return offline
    },
    async getAll(handle, page) {
      return offlineRepository.getAll(handle, page)
    },
    async create(handle, data) {
      return offlineRepository.create(handle, data)
    },
    async update(handle, id, data) {
      return offlineRepository.update(handle, id, data)
    },
    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `offlines/${Date.now()}-${uuid}-${filename}`

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
