import type {
  Membership,
  NotificationPermissions,
  NotificationPermissionsWrite,
  PrivacyPermissions,
  PrivacyPermissionsWrite,
  User,
  UserId,
  UserWrite,
} from "@dotkomonline/types"
import { getAcademicYear } from "@dotkomonline/utils"
import type { FeideGroup, FeideGroupsRepository } from "../external/feide-groups-repository"
import type {
  NTNUStudyplanRepository,
  StudyplanCourse,
} from "../external/ntnu-studyplan-repository/ntnu-studyplan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"
import { UserNoFeideTokenError } from "./user-error"

export interface UserService {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, offset: number): Promise<User[]>
  searchForUser(query: string, limit: number, offset: number): Promise<User[]>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  update(userId: UserId, data: Partial<UserWrite>): Promise<User>
  refreshMembership(userId: UserId): Promise<Membership | null>
  registerAndGet(auth0Id: string): Promise<User>
}

const ONLINE_MASTER_PROGRAMMES = ["MSIT", "MIT"]
const ONLINE_BACHELOR_PROGRAMMES = ["BIT"]

export class UserServiceImpl implements UserService {
  private readonly userRepository: UserRepository
  private readonly privacyPermissionsRepository: PrivacyPermissionsRepository
  private readonly notificationPermissionsRepository: NotificationPermissionsRepository
  private readonly feideGroupsRepository:FeideGroupsRepository
  private readonly ntnuStudyplanRepository: NTNUStudyplanRepository

  constructor(
    userRepository: UserRepository,
    privacyPermissionsRepository: PrivacyPermissionsRepository,
    notificationPermissionsRepository: NotificationPermissionsRepository,
    feideGroupsRepository: FeideGroupsRepository,
    ntnuStudyplanRepository: NTNUStudyplanRepository,
  ) {
    this.userRepository = userRepository
    this.privacyPermissionsRepository = privacyPermissionsRepository
    this.notificationPermissionsRepository = notificationPermissionsRepository
    this.feideGroupsRepository = feideGroupsRepository
    this.ntnuStudyplanRepository = ntnuStudyplanRepository
  }

  async registerAndGet(auth0Id: string) {
    return this.userRepository.registerAndGet(auth0Id)
  }

  async getById(auth0Id: string) {
    return this.userRepository.getById(auth0Id)
  }

  async update(userId: UserId, data: Partial<UserWrite>): Promise<User> {
    return this.userRepository.update(userId, data)
  }

  async getAll(limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.getAll(limit, offset)
  }

  async refreshMembership(userId: UserId): Promise<Membership | null> {
    const { user, accessToken } = await this.userRepository.getByIdWithFeideAccessToken(userId)

    if (!user) {
      throw new Error("Could not find user to refresh membership for")
    }

    if (!accessToken) {
      throw new UserNoFeideTokenError("User does not have a FEIDE access token")
    }

    const { studyProgrammes, studySpecializations, courses } =
      await this.feideGroupsRepository.getStudentInformation(accessToken)

    const defaultMembership = await this.calculateDefaultMembership(studyProgrammes, studySpecializations, courses)
    const existingMembership = user.membership;

    if (!defaultMembership) {
      return existingMembership ?? null;
    }

    // Use the calculated membership if the user does not already have one 
    if (!existingMembership) {
      await this.userRepository.update(userId, { membership: defaultMembership })

      return defaultMembership
    }

    // Replace bachelor memberships with master memberships
    if (existingMembership.type === "BACHELOR" && defaultMembership.type === "MASTER") {
      await this.userRepository.update(userId, { membership: defaultMembership })

      return defaultMembership
    }

    return defaultMembership
  }

  private async calculateDefaultMembership(
    studyProgrammes: FeideGroup[],
    studySpecializations: FeideGroup[],
    courses: FeideGroup[]
  ): Promise<Membership | null> {
    const masterProgramme = studyProgrammes.find((programme) => ONLINE_MASTER_PROGRAMMES.includes(programme.code))
    const bachelorProgramme = studyProgrammes.find((programme) => ONLINE_BACHELOR_PROGRAMMES.includes(programme.code))

    // Master programmes take precedence over bachelor programmes
    const relevantProgramme = masterProgramme ?? bachelorProgramme

    if (!relevantProgramme) {
      return null
    }

    const programmeLength = masterProgramme ? 2 : 3
    const estimatedStudyGrade = await this.estimateStudyGrade(relevantProgramme.code, programmeLength, courses)
    const estimatedStartYear = getAcademicYear(new Date()) - estimatedStudyGrade + 1;
 
    if (masterProgramme) {
      return {
        type: "MASTER",
        start_year: estimatedStartYear,
        specialization: studySpecializations.length > 0 ? studySpecializations[0].code : undefined,
      }
    }

    return {
      type: "BACHELOR",
      start_year: estimatedStartYear,
    }
  }

  // This function takes a list of courses from the study plan and a list of courses taken by the user, and estimates the grade level of the user (klassetrinn)
  private async estimateStudyGrade(programmeCode: string, programmeLength: number, coursesTaken: FeideGroup[]): Promise<number> {
    // Get the newest study plan we can be sure is complete
    const studyplanYear = getAcademicYear(new Date()) - programmeLength
    const studyplanCourses = await this.ntnuStudyplanRepository.getStudyplanCourses(
      programmeCode,
      studyplanYear
    )

    // Sum up how much each course from the study plan indicates each grade level in the study plan
    // Example: { TDT4100: { "1": 7.5 } }, Object oriented programming indicates a first year (grade 1) with 7.5 credits indication strength
    const courseGradeIndications: Record<string, { grade: number; credits: number }> = {}

    for (const course of studyplanCourses) {
      // Use 7.5 credits if not specified or zero
      const courseCredits = Number.parseFloat(course.credit ?? "7.5")

      console.log(course)

      courseGradeIndications[course.code] = { grade: course.year, credits: courseCredits }
    }

    console.log("Course year indications:", courseGradeIndications)

    const totalGradeIndications: Record<number, number> = {}

    for (const course of coursesTaken) {
      if (!courseGradeIndications[course.code]) {
        continue
      }

      if (!course.finished) {
        continue
      }

      const yearSinceTakenCourse = getAcademicYear(new Date()) - getAcademicYear(course.finished)

      const { grade, credits } = courseGradeIndications[course.code]

      const indicatedGrade = grade + yearSinceTakenCourse

      console.log(`Course ${course.code} indicates grade ${indicatedGrade} with ${credits} credits`)

      totalGradeIndications[indicatedGrade] = (totalGradeIndications[indicatedGrade] ?? 0) + credits
    }

    const indicatedGrade = Number.parseInt(
      Object.entries(totalGradeIndications).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    )

    console.log("Grade indication:", totalGradeIndications)

    return indicatedGrade
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
