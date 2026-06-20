import type { DBHandle } from "@dotkomonline/db"
import { NotFoundError } from "../../error"
import type { Fadderuke, FadderukeId, FadderukeWrite } from "./fadderuke"
import type { FadderukeRepository } from "./fadderuke-repository"

export interface FadderukeService {
  create(handle: DBHandle, data: FadderukeWrite): Promise<Fadderuke>
  update(handle: DBHandle, fadderukeId: FadderukeId, data: Partial<FadderukeWrite>): Promise<Fadderuke>
  delete(handle: DBHandle, fadderukeId: FadderukeId): Promise<void>
  getById(handle: DBHandle, fadderukeId: FadderukeId): Promise<Fadderuke>
  findByYear(handle: DBHandle, year: number): Promise<Fadderuke | null>
  findMany(handle: DBHandle): Promise<Fadderuke[]>
}

export function getFadderukeService(fadderukeRepository: FadderukeRepository): FadderukeService {
  return {
    async create(handle, data) {
      return await fadderukeRepository.create(handle, data)
    },

    async update(handle, fadderukeId, data) {
      await this.getById(handle, fadderukeId)

      return await fadderukeRepository.update(handle, fadderukeId, data)
    },

    async delete(handle, fadderukeId) {
      await this.getById(handle, fadderukeId)

      await fadderukeRepository.delete(handle, fadderukeId)
    },

    async getById(handle, fadderukeId) {
      const fadderuke = await fadderukeRepository.findById(handle, fadderukeId)

      if (!fadderuke) {
        throw new NotFoundError(`Fadderuke(ID=${fadderukeId}) not found`)
      }

      return fadderuke
    },

    async findByYear(handle, year) {
      return await fadderukeRepository.findByYear(handle, year)
    },

    async findMany(handle) {
      return await fadderukeRepository.findMany(handle)
    },
  }
}
