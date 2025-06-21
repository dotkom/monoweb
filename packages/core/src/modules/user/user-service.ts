import type {
  Membership,
  NotificationPermissions,
  NotificationPermissionsWrite,
  PrivacyPermissions,
  PrivacyPermissionsWrite,
  User,
  UserId,
  UserWrite,
  NTNUGroup,
} from "@dotkomonline/types"
import { getAcademicYear } from "@dotkomonline/utils"
import type { NTNUGroupsRepository } from "../external/feide-groups-repository"
import type {
  NTNUStudyplanRepository,
  StudyplanCourse,
} from "../external/ntnu-studyplan-repository/ntnu-studyplan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"
import { UserNotFoundError } from "./user-error"

export interface UserService {
  getById(id: UserId): Promise<User>
  getAll(limit: number, offset: number): Promise<User[]>
  searchForUser(query: string, limit: number, offset: number): Promise<User[]>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  update(userId: UserId, data: Partial<UserWrite>): Promise<User>
  register(auth0Id: string): Promise<void>
}

const ONLINE_MASTER_PROGRAMMES = ["MSIT", "MIT"]
const ONLINE_BACHELOR_PROGRAMMES = ["BIT"]

export class UserServiceImpl implements UserService {
  private readonly userRepository: UserRepository
  private readonly privacyPermissionsRepository: PrivacyPermissionsRepository
  private readonly notificationPermissionsRepository: NotificationPermissionsRepository
  private readonly feideGroupsRepository: NTNUGroupsRepository
  private readonly ntnuStudyplanRepository: NTNUStudyplanRepository

  constructor(
    userRepository: UserRepository,
    privacyPermissionsRepository: PrivacyPermissionsRepository,
    notificationPermissionsRepository: NotificationPermissionsRepository,
    feideGroupsRepository: NTNUGroupsRepository,
    ntnuStudyplanRepository: NTNUStudyplanRepository
  ) {
    this.userRepository = userRepository
    this.privacyPermissionsRepository = privacyPermissionsRepository
    this.notificationPermissionsRepository = notificationPermissionsRepository
    this.feideGroupsRepository = feideGroupsRepository
    this.ntnuStudyplanRepository = ntnuStudyplanRepository
  }

  async register(auth0Id: string) {
    const { user, feideAccessToken } = await this.userRepository.getByIdWithFeideAccessToken(auth0Id)

    await this.userRepository.register(auth0Id)

    if (feideAccessToken) {
      await this.refreshMembership(feideAccessToken, user, auth0Id)
    }
  }

  private async refreshMembership(feideAccessToken: string, user: User | null, auth0Id: string) {
    const { studyProgrammes, studySpecializations, courses } =
      await this.feideGroupsRepository.getStudentInformation(feideAccessToken)

    const defaultMembership = await this.calculateDefaultMembership(studyProgrammes, studySpecializations, courses)

    if (this.shouldReplaceMembership(user?.membership ?? null, defaultMembership)) {
      await this.userRepository.update(auth0Id, {
        membership: defaultMembership,
      })
    }
  }

  private async calculateDefaultMembership(
    studyProgrammes: NTNUGroup[],
    studySpecializations: NTNUGroup[],
    courses: NTNUGroup[]
  ): Promise<Membership | null> {
    const masterProgramme = studyProgrammes.find((programme) => ONLINE_MASTER_PROGRAMMES.includes(programme.code))
    const bachelorProgramme = studyProgrammes.find((programme) => ONLINE_BACHELOR_PROGRAMMES.includes(programme.code))

    // Master programmes take precedence over bachelor programmes
    const relevantProgramme = masterProgramme ?? bachelorProgramme

    if (!relevantProgramme) {
      return null
    }

    const studyLength = masterProgramme ? 2 : 3
    // Get the newest study plan we can be sure is complete
    const studyplanYear = getAcademicYear(new Date()) - studyLength
    const studyplanCourses = await this.ntnuStudyplanRepository.getStudyplanCourses(
      relevantProgramme.code,
      studyplanYear
    )

    const estimatedStudyGrade = await this.estimateStudyGrade(studyplanCourses, courses)
    const estimatedStudyYear = getAcademicYear(new Date()) - estimatedStudyGrade + 1

    if (masterProgramme) {
      return {
        type: "MASTER",
        start_year: estimatedStudyYear,
        specialization: studySpecializations?.[0].code,
      }
    }

    return {
      type: "BACHELOR",
      start_year: estimatedStudyYear,
    }
  }

  // This function takes a list of courses from the study plan and a list of courses taken by the user, and estimates the grade level of the user (klassetrinn)
  async estimateStudyGrade(studyplanCourses: StudyplanCourse[], coursesTaken: NTNUGroup[]): Promise<number> {
    // Sum up how much each course from the study plan indicates each grade level in the study plan
    // Example: { TDT4100: { "1": 7.5 } }, Object oriented programming indicates a first year (grade 1) with 7.5 credits indication strength
    const courseGradeIndications: Record<string, { grade: number; credits: number }> = {}

    for (const course of studyplanCourses) {
      // Use 7.5 credits if not specified or zero
      const courseCredits = Number.parseFloat(course.credit ?? "7.5")

      courseGradeIndications[course.code] = { grade: course.year, credits: courseCredits }
    }

    const totalGradeIndications: Record<number, number> = {}

    for (const course of coursesTaken) {
      // If the course is not in the study plan, we ignore it
      if (!courseGradeIndications[course.code]) {
        continue
      }

      // This might mean the user is currently taking the course, but it also may be wrong as the feide api does not reliably track finished date
      // Therefore we ignore it
      if (!course.finished) {
        continue
      }

      const yearSinceTakenCourse = getAcademicYear(new Date()) - getAcademicYear(course.finished)

      const { grade, credits } = courseGradeIndications[course.code]

      const indicatedGrade = grade + yearSinceTakenCourse

      totalGradeIndications[indicatedGrade] = (totalGradeIndications[indicatedGrade] ?? 0) + credits
    }

    // Find the key with highest value - JS has ZERO nice utility functions :(
    const indicatedGrade = Number.parseInt(
      Object.entries(totalGradeIndications).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    )

    return indicatedGrade
  }

  shouldReplaceMembership(currentMembership: Membership | null, newMembership: Membership | null) {
    if (!newMembership) {
      return false
    }

    if (!currentMembership) {
      return true
    }

    if (currentMembership.type === "BACHELOR" && newMembership.type === "MASTER") {
      return true
    }

    if (currentMembership.type === "SOCIAL") {
      return true
    }

    return false
  }

  async getById(userId: UserId) {
    const user = await this.userRepository.getById(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    return user
  }

  async update(userId: UserId, data: Partial<UserWrite>): Promise<User> {
    return this.userRepository.update(userId, data)
  }

  async getAll(limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.getAll(limit, offset)
  }

  // https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
  async searchForUser(query: string, limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.searchForUser(query, limit, offset)
  }

  async getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions> {
    let privacyPermissions = await this.privacyPermissionsRepository.getByUserId(id)

    if (!privacyPermissions) {
      privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id })
    }

    return privacyPermissions
  }

  async updatePrivacyPermissionsForUserId(
    id: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions> {
    let privacyPermissions = await this.privacyPermissionsRepository.update(id, data)

    if (!privacyPermissions) {
      privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id, ...data })
    }

    return privacyPermissions
  }

  async getNotificationPermissionsByUserId(id: string): Promise<NotificationPermissions> {
    let notificationPermissions = await this.notificationPermissionsRepository.getByUserId(id)

    if (!notificationPermissions) {
      notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id })
    }

    return notificationPermissions
  }

  async updateNotificationPermissionsForUserId(
    id: string,
    data: Partial<Omit<NotificationPermissionsWrite, "userId">>
  ): Promise<NotificationPermissions> {
    let notificationPermissions = await this.notificationPermissionsRepository.update(id, data)

    if (!notificationPermissions) {
      notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id, ...data })
    }

    return notificationPermissions
  }
}
