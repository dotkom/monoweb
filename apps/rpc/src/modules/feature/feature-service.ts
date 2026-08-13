import type { DBHandle } from "@dotkomonline/db"
import type { Feature, FeatureWrite } from "./feature"
import type { FeatureRepository } from "./feature-repository"

export interface FeatureService {
  findMany(handle: DBHandle): Promise<Feature[]>
  findActive(handle: DBHandle, now?: Date): Promise<Feature[]>
  update(handle: DBHandle, data: FeatureWrite): Promise<Feature>
}

export function getFeatureService(repository: FeatureRepository): FeatureService {
  return {
    findMany: (handle) => repository.findMany(handle),
    findActive: (handle, now = new Date()) => repository.findActive(handle, now),
    update: (handle, data) => repository.update(handle, data),
  }
}
