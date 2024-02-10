import { type Database } from "@/server/kysely"
import { type FacultyRepository, FacultyRepositoryImpl } from "@/server/faculty-repository"
import { type HkdirService, HkdirServiceImpl } from "@/server/hkdir-service"

export interface CreateServiceLayerOptions {
  fetch: WindowOrWorkerGlobalScope["fetch"]
  db: Database
}

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export const createServiceLayer = (opts: CreateServiceLayerOptions) => {
  const facultyRepository: FacultyRepository = new FacultyRepositoryImpl(opts.db)
  const hkdirService: HkdirService = new HkdirServiceImpl(opts.fetch)

  return {
    facultyRepository,
    hkdirService,
  }
}
