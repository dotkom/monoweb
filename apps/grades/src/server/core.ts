import { type Database } from "@/server/kysely"
import { type FacultyRepository, FacultyRepositoryImpl } from "@/server/faculty-repository"
import { type HkdirService, HkdirServiceImpl } from "@/server/hkdir-service"
import { type DepartmentRepository, DepartmentRepositoryImpl } from "@/server/department-repository"
import { type JobService, JobServiceImpl } from "@/server/job-service"
import { type SubjectRepository, SubjectRepositoryImpl } from "@/server/subject-repository"

export interface CreateServiceLayerOptions {
  fetch: WindowOrWorkerGlobalScope["fetch"]
  db: Database
}

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export const createServiceLayer = (opts: CreateServiceLayerOptions) => {
  const facultyRepository: FacultyRepository = new FacultyRepositoryImpl(opts.db)
  const departmentRepository: DepartmentRepository = new DepartmentRepositoryImpl(opts.db)
  const subjectRepository: SubjectRepository = new SubjectRepositoryImpl(opts.db)
  const hkdirService: HkdirService = new HkdirServiceImpl(opts.fetch)
  const jobService: JobService = new JobServiceImpl(
    facultyRepository,
    departmentRepository,
    subjectRepository,
    hkdirService
  )

  return {
    hkdirService,
    jobService,
  }
}
