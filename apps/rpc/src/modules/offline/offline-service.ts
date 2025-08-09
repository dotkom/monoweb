import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { OfflineNotFoundError } from "./offline-error"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  /**
   * Get an offline by its id
   *
   * @throws {OfflineNotFoundError} if the offline does not exist
   */
  getById(handle: DBHandle, offlineId: OfflineId): Promise<Offline>
  getAll(handle: DBHandle, page: Pageable): Promise<Offline[]>
  create(handle: DBHandle, data: OfflineWrite): Promise<Offline>
  update(handle: DBHandle, offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
  createOfflineUploadURL(filename: string, mimeType: string): Promise<PresignedPost>
}

export function getOfflineService(
  offlineRepository: OfflineRepository,
  client: S3Client,
  bucket: string
): OfflineService {
  return {
    async getById(handle, id) {
      const offline = await offlineRepository.getById(handle, id)
      if (!offline) throw new OfflineNotFoundError(id)
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
    async createOfflineUploadURL(filename, mimeType) {
      const uuid = crypto.randomUUID()
      const key = `offlines/${Date.now()}-${uuid}-${filename}`
      // Kind of arbitrary, but this is gmail max size for attachments, so I figured it's a sane max size.
      const maxSizeMB = 25
      return await createPresignedPost(client, {
        Bucket: bucket,
        Key: key,
        Fields: {
          "content-type": mimeType,
        },
        Conditions: [["content-length-range", 0, maxSizeMB * 1024 * 1024]],
      })
    },
  }
}
