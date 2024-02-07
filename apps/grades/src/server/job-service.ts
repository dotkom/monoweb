import { getLogger } from "@dotkomonline/logger"
import { type FacultyRepository } from "@/server/faculty-repository"
import { type HkdirService } from "@/server/hkdir-service"
import { type DepartmentRepository } from "@/server/department-repository"
import { type SubjectRepository } from "@/server/subject-repository"
import { executeWithAsyncQueue } from "@/server/util"

export interface JobService {
  performFacultySynchronizationJob(): Promise<void>
  performSubjectSynchronizationJob(): Promise<void>
}

export class JobServiceImpl implements JobService {
  private readonly logger = getLogger("JobService")

  public constructor(
    private readonly facultyRepository: FacultyRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly hkdirService: HkdirService
  ) {}

  /**
   * Synchronize faculties from HKDir to the database.
   *
   * HKDir departments are used to represent both faculties and departments in our data model. In HKDir, a department is
   * of either level two or three. A level two department is a faculty in our model, while level three departments are
   * the equivalent of departments.
   *
   * Because of this hierarchy, a level three department MUST have a matching level two department before creation.
   */
  public async performFacultySynchronizationJob(): Promise<void> {
    this.logger.info("Synchronizing faculties from HKDir")
    const faculties = await this.hkdirService.getDepartments("1150")
    this.logger.info(`Beginning synchronization of ${faculties.length} faculties`)

    await executeWithAsyncQueue({
      build: (queue, concurrency) => {
        this.logger.info(`Processing faculties using async queue with ${concurrency} concurrency`)
        for (const faculty of faculties) {
          queue.add(async () => {
            // Attempt to register the faculty (level two institution)
            let existingFaculty = await this.facultyRepository.getFacultyByReferenceId(faculty.Fakultetskode)
            if (existingFaculty === null) {
              existingFaculty = await this.facultyRepository.createFaculty({
                name: faculty.Fakultetsnavn,
                refId: faculty.Fakultetskode,
              })
            }

            // Attempt to register the department (level three institution)
            let existingDepartment = await this.departmentRepository.getDepartmentByReferenceId(faculty.Avdelingskode)
            if (existingDepartment === null) {
              existingDepartment = await this.departmentRepository.createDepartment({
                name: faculty.Avdelingsnavn,
                refId: faculty.Avdelingskode,
                facultyId: existingFaculty.id,
              })
            }
          })
        }
      },
      onTaskComplete: (remainingTasks) => {
        if (remainingTasks && remainingTasks % 100 === 0) {
          this.logger.info(`Queue processing for faculties reached ${remainingTasks} jobs left`)
        }
      },
    })
    this.logger.info("Synchronization of faculties complete")
  }

  public async performSubjectSynchronizationJob() {
    this.logger.info("Synchronizing subjects from HKDir")
    const subjects = await this.hkdirService.getSubjects("1150")
    this.logger.info(`Beginning synchronization of ${subjects.length} subjects`)

    await executeWithAsyncQueue({
      build: (queue, concurrency) => {
        this.logger.info(`Processing subjects using async queue with ${concurrency} concurrency`)
        for (const subject of subjects) {
          queue.add(async () => {
            // Pull the department for the given subject from the database
            const department = await this.departmentRepository.getDepartmentByReferenceId(subject.Avdelingskode)
            if (department === null) {
              throw new Error(`Department with reference ID ${subject.Avdelingskode} not found`)
            }

            // Attempt to register the subject
            let existingSubject = await this.subjectRepository.getSubjectByReferenceId(subject.Emnekode)
            if (existingSubject === null) {
              // A lot of subjects have a -x suffix, which we want to remove for the slug
              const slug = subject.Emnekode.replace(/-[12ABK]$/, "").toLowerCase()
              existingSubject = await this.subjectRepository.createSubject({
                name: subject.Emnenavn,
                refId: subject.Emnekode,
                educationalLevel: subject.Nivåkode,
                instructionLanguage: subject["Underv.språk"],
                credits: parseFloat(subject.Studiepoeng),
                departmentId: department.id,
                slug,
              })
            }
          })
        }
      },
      onTaskComplete: (remainingTasks) => {
        if (remainingTasks && remainingTasks % 100 === 0) {
          this.logger.info(`Queue processing for subjects reached ${remainingTasks} jobs left`)
        }
      },
    })
    this.logger.info("Synchronization of subjects complete")
  }
}
