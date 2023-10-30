import { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { OfflineRepository } from "./offline-repository"

export interface OfflineService {
  get(id: OfflineId): Promise<Offline>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(payload: OfflineWrite): Promise<Offline>
  update(id: OfflineId, payload: OfflineWrite): Promise<Offline>
}

export class OfflineServiceImpl implements OfflineService {
  constructor(private readonly offlineRepository: OfflineRepository) {}

  async get(id: OfflineId): Promise<Offline> {
    const offline = await this.offlineRepository.getById(id)
    if (!offline) throw new NotFoundError(`Offline with ID:${id} not found`)
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
}
