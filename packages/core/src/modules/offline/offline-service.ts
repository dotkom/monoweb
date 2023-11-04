import { type Offline, type OfflineId, type OfflineWrite } from "@dotkomonline/types"
import { type OfflineRepository } from "./offline-repository"
import { type S3Repository } from "../../../../static-object-s3/src"
import { NotFoundError } from "../../errors/errors"
import { type Cursor } from "../../utils/db-utils"

type Fields = Record<string, string>

export interface PresignedPost {
  url: string
  fields: Fields
}

export interface OfflineService {
  get(id: OfflineId): Promise<Offline>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(payload: OfflineWrite): Promise<Offline>
  update(id: OfflineId, payload: OfflineWrite): Promise<Offline>
}

export class OfflineServiceImpl implements OfflineService {
  constructor(
    private readonly offlineRepository: OfflineRepository,
    private readonly S3Repository: S3Repository
  ) {}

  async get(id: OfflineId): Promise<Offline> {
    const offline = await this.offlineRepository.getById(id)
    if (!offline) {
      throw new NotFoundError(`Offline with ID:${id} not found`)
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

  async update(id: OfflineId, payload: OfflineWrite): Promise<Offline> {
    const offline = await this.offlineRepository.update(id, payload)
    return offline
  }

  async getPresignedUrl(filename: string, mimeType: string): Promise<PresignedPost> {
    const link = await this.S3Repository.getPresignedPostData("skog-testing", filename, mimeType, 10)
    return link
  }
}
