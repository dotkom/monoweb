import { type Database } from "@/server/kysely"
import { type FacultyRepository, FacultyRepositoryImpl } from "@/server/faculty-repository"
import { type DepartmentRepository, DepartmentRepositoryImpl } from "@/server/department-repository"
import { type SubjectRepository, SubjectRepositoryImpl } from "@/server/subject-repository"
import { type GradeRepository, GradeRepositoryImpl } from "@/server/grade-repository"
import { type SubjectService, SubjectServiceImpl } from "@/server/subject-service"

export interface CreateServiceLayerOptions {
  fetch: WindowOrWorkerGlobalScope["fetch"]
  db: Database
}

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export const createServiceLayer = (opts: CreateServiceLayerOptions) => {
  const _facultyRepository: FacultyRepository = new FacultyRepositoryImpl(opts.db)
  const _departmentRepository: DepartmentRepository = new DepartmentRepositoryImpl(opts.db)
  const subjectRepository: SubjectRepository = new SubjectRepositoryImpl(opts.db)
  const _gradeRepository: GradeRepository = new GradeRepositoryImpl(opts.db)
  const subjectService: SubjectService = new SubjectServiceImpl(subjectRepository)

  return {
    subjectService,
  }
}
