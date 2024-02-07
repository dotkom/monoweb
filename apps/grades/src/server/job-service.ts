import { type FacultyRepository } from "@/server/faculty-repository"
import { type HkdirService } from "@/server/hkdir-service"
import { type DepartmentRepository } from "@/server/department-repository"

export interface JobService {
  performFacultySynchronizationJob(): Promise<void>
}

export class JobServiceImpl implements JobService {
  public constructor(
    private readonly facultyRepository: FacultyRepository,
    private readonly departmentRepository: DepartmentRepository,
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
    const faculties = await this.hkdirService.getDepartments("1150")
    for (const faculty of faculties) {
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
    }
  }
}
