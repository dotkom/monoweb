import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import type { AssetService, PresignedPost } from "../asset/asset-service"
import { OfflineNotFoundError } from "./offline-error"
import type { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  get(id: OfflineId): Promise<Offline>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(payload: OfflineWrite): Promise<Offline>
  update(id: OfflineId, payload: Partial<OfflineWrite>): Promise<Offline>
  createPresignedPost(filename: string, mimeType: string): Promise<PresignedPost>
}

export class OfflineServiceImpl implements OfflineService {
  constructor(
    private readonly offlineRepository: OfflineRepository,
    private readonly assetService: AssetService
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
    return this.assetService.createPresignedPost(filename, mimeType, 50)
  }
}
