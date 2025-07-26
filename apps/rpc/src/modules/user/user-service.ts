import type { DBHandle } from "@dotkomonline/db"
import {
  type Auth0UserWrite,
  Auth0UserWriteSchema,
  DBUserWriteSchema,
  type Membership,
  type NTNUGroup,
  type PrivacyPermissions,
  type PrivacyPermissionsWrite,
  type User,
  type UserId,
  type UserProfileSlug,
} from "@dotkomonline/types"
import { getAcademicYear } from "@dotkomonline/utils"
import type { FeideGroupsRepository } from "../feide/feide-groups-repository"
import type { NTNUStudyPlanRepository, StudyplanCourse } from "../ntnu-study-plan/ntnu-study-plan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { UserNotFoundError } from "./user-error"
import type { UserRepository } from "./user-repository"

export interface UserService {
  getById(handle: DBHandle, id: UserId): Promise<User>
  getByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User>
  getAll(handle: DBHandle, limit: number, offset: number): Promise<User[]>
  /**
   * @see https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
   */
  searchForUser(handle: DBHandle, query: string, limit: number, offset: number): Promise<User[]>
  getPrivacyPermissionsByUserId(handle: DBHandle, id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    handle: DBHandle,
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  update(handle: DBHandle, userId: UserId, data: Partial<Auth0UserWrite>): Promise<User>
  register(handle: DBHandle, auth0Id: string): Promise<void>
}

const ONLINE_MASTER_PROGRAMMES = ["MSIT", "MIT"]
const ONLINE_BACHELOR_PROGRAMMES = ["BIT"]

export function getUserService(
  userRepository: UserRepository,
  privacyPermissionsRepository: PrivacyPermissionsRepository,
  notificationPermissionsRepository: NotificationPermissionsRepository,
  feideGroupsRepository: FeideGroupsRepository,
  ntnuStudyPlanRepository: NTNUStudyPlanRepository
): UserService {
  function shouldReplaceMembership(currentMembership: Membership | null, newMembership: Membership | null) {
    if (!newMembership) {
      return false
    }
    if (!currentMembership) {
      return true
    }
    if (currentMembership.type === "BACHELOR" && newMembership.type === "MASTER") {
      return true
    }
    return currentMembership.type === "SOCIAL"
  }

  async function refreshMembership(handle: DBHandle, feideAccessToken: string, user: User | null, auth0Id: string) {
    const { studyProgrammes, studySpecializations, courses } =
      await feideGroupsRepository.getStudentInformation(feideAccessToken)

    const currentMembership = user?.membership ?? null
    const newMembership = await calculateMembership(studyProgrammes, studySpecializations, courses)

    if (!shouldReplaceMembership(currentMembership, newMembership)) {
      return
    }

    await userRepository.update(
      handle,
      auth0Id,
      {
        membership: newMembership,
      },
      {}
    )
  }

  async function calculateMembership(
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
    const studyplanCourses = await ntnuStudyPlanRepository.getStudyPlanCourses(relevantProgramme.code, studyplanYear)

    const estimatedStudyGrade = await estimateStudyGrade(studyplanCourses, courses)
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
  async function estimateStudyGrade(studyplanCourses: StudyplanCourse[], coursesTaken: NTNUGroup[]): Promise<number> {
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

  return {
    async register(handle, auth0Id) {
      const { user, feideAccessToken } = await userRepository.getByIdWithFeideAccessToken(handle, auth0Id)
      await userRepository.register(handle, auth0Id)
      if (feideAccessToken) {
        await refreshMembership(handle, feideAccessToken, user, auth0Id)
      }
    },
    async getById(handle, userId) {
      const user = await userRepository.getById(handle, userId)
      if (!user) {
        throw new UserNotFoundError(userId)
      }
      return user
    },
    async getByProfileSlug(handle, profileSlug) {
      const user = await userRepository.getByProfileSlug(handle, profileSlug)
      if (!user) {
        throw new UserNotFoundError(profileSlug)
      }
      return user
    },
    async update(handle, userId, data) {
      const auth0UserData = Auth0UserWriteSchema.partial().parse(data)
      const owUserData = DBUserWriteSchema.partial().parse(data)

      return await userRepository.update(handle, userId, auth0UserData, owUserData)
    },
    async getAll(handle, limit, offset) {
      return await userRepository.getAll(handle, limit, offset)
    },
    async searchForUser(handle, query, limit, offset) {
      return await userRepository.searchForUser(handle, query, limit, offset)
    },
    async getPrivacyPermissionsByUserId(handle, id) {
      let privacyPermissions = await privacyPermissionsRepository.getByUserId(handle, id)
      if (privacyPermissions === null) {
        privacyPermissions = await privacyPermissionsRepository.create(handle, id, {})
      }
      return privacyPermissions
    },
    async updatePrivacyPermissionsForUserId(handle, id, data) {
      let privacyPermissions = await privacyPermissionsRepository.update(handle, id, data)
      if (!privacyPermissions) {
        privacyPermissions = await privacyPermissionsRepository.create(handle, id, data)
      }
      return privacyPermissions
    },
  }
}
