import { getLogger } from "@dotkomonline/logger"
import { type FacultyRepository } from "@/server/faculty-repository"
import { type HkdirService } from "@/server/hkdir-service"
import { type DepartmentRepository } from "@/server/department-repository"
import { type SubjectRepository } from "@/server/subject-repository"
import { executeWithAsyncQueue } from "@/server/util"
import { type GradeRepository } from "@/server/grade-repository"
import { mapHkdirGradeToGrade, mapHkdirSemesterToSeason } from "@/server/hkdir-util"

export interface JobService {
  performFacultySynchronizationJob(): Promise<void>
  performSubjectSynchronizationJob(): Promise<void>
  performGradeSynchronizationJob(): Promise<void>
}

// TODO: Evaluate whether all of these should run in PostGreSQL transactions
export class JobServiceImpl implements JobService {
  private readonly logger = getLogger("JobService")

  public constructor(
    private readonly facultyRepository: FacultyRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly gradeRepository: GradeRepository,
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

  /**
   * Synchronize grades from HKDir to the database.
   *
   * This job is a bit more complex than the others, because HKDir doesn't provide a result-set for the grades. Instead
   * they provide a list of subjects, and for each subject a list of grades. This means we have to iterate over all
   * subjects, and for each subject iterate over all grades.
   */
  public async performGradeSynchronizationJob() {
    this.logger.info("Synchronizing grades from HKDir")
    const grades = await this.hkdirService.getSubjectGrades("1150")
    this.logger.info(`Beginning synchronization of ${grades.length} grades`)

    await executeWithAsyncQueue({
      build: (queue, concurrency) => {
        this.logger.info(`Processing grades using async queue with ${concurrency} concurrency`)
        for (const grade of grades) {
          queue.add(async () => {
            // We need a reference to the subject from the reference id given by HKDir
            const subject = await this.subjectRepository.getSubjectByReferenceId(grade.Emnekode)
            if (subject === null) {
              // TODO: Evaluate whether we should create the subject if it doesn't exist
              return
            }

            // First we need to get or insert the matching grade.
            let existingGrade = await this.gradeRepository.getGradeBySemester(
              subject.id,
              mapHkdirSemesterToSeason(grade.Semester),
              parseInt(grade.Årstall)
            )
            if (existingGrade === null) {
              existingGrade = await this.gradeRepository.createGrade({
                subjectId: subject.id,
                season: mapHkdirSemesterToSeason(grade.Semester),
                year: parseInt(grade.Årstall),
                grade: 0,
              })
            }

            // If there exists a previous write log entry for the subject, season, year and grade, we need to skip this
            // grade, as it has already been processed.
            const previousWriteLogEntry = await this.gradeRepository.getPreviousWriteLogEntry(
              existingGrade.subjectId,
              mapHkdirSemesterToSeason(grade.Semester),
              parseInt(grade.Årstall),
              grade.Karakter
            )
            if (previousWriteLogEntry !== null) {
              return
            }

            // Then we need to update the grade distribution for the current grade
            const key = mapHkdirGradeToGrade(grade.Karakter)
            const studentsWithGrade = parseInt(grade["Antall kandidater totalt"])
            await this.gradeRepository.updateGradeWithExplicitLock(
              existingGrade.id,
              {
                [key]: studentsWithGrade,
              },
              grade.Karakter
            )
          })
        }
      },
      onTaskComplete: (remainingTasks) => {
        if (remainingTasks && remainingTasks % 100 === 0) {
          this.logger.info(`Queue processing for grades reached ${remainingTasks} jobs left`)
        }
      },
    })
    this.logger.info("Synchronization of grades complete")
  }
}
