import * as crypto from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  type Membership,
  MembershipSpecializationSchema,
  type MembershipWrite,
  type NTNUGroup,
  type User,
  type UserFilterQuery,
  type UserId,
  type UserProfileSlug,
  type UserWrite,
  UserWriteSchema,
  getAcademicStart,
  getActiveMembership,
} from "@dotkomonline/types"
import { getCurrentUtc } from "@dotkomonline/utils"
import type { ManagementClient } from "auth0"
import { addYears, differenceInYears } from "date-fns"
import type { Pageable } from "../../query"
import type { FeideGroupsRepository } from "../feide/feide-groups-repository"
import type { NTNUStudyPlanRepository, StudyplanCourse } from "../ntnu-study-plan/ntnu-study-plan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { UserFetchError, UserNotFoundError } from "./user-error"
import type { UserRepository } from "./user-repository"

export interface UserService {
  /**
   * Find a user by their ID, or null if not found.
   *
   * This function will attempt to register the user if, and only if:
   * 1. The user is not found in the local database
   * 2. The user exists in Auth0's user directory.
   *
   * For this reason, the call might be slower than expected, as it makes network requests to Auth0 and potentially
   * Feide APIs.
   */
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  findByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  findUsers(handle: DBHandle, query: UserFilterQuery, page?: Pageable): Promise<User[]>
  getById(handle: DBHandle, id: UserId): Promise<User>
  getByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  register(handle: DBHandle, subject: string): Promise<User>
  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
  /**
   * Find the Feide federated access token for a user, if it exists
   */
  findFeideAccessTokenByUserId(userId: UserId): Promise<string | null>
}

const ONLINE_MASTER_PROGRAMMES = ["MSIT", "MIT"]
const ONLINE_BACHELOR_PROGRAMMES = ["BIT"]

export function getUserService(
  userRepository: UserRepository,
  privacyPermissionsRepository: PrivacyPermissionsRepository,
  notificationPermissionsRepository: NotificationPermissionsRepository,
  feideGroupsRepository: FeideGroupsRepository,
  ntnuStudyPlanRepository: NTNUStudyPlanRepository,
  managementClient: ManagementClient
): UserService {
  const logger = getLogger("user-service")
  async function refreshMembership(handle: DBHandle, feideAccessToken: string, user: User) {
    const { studyProgrammes, studySpecializations, courses } =
      await feideGroupsRepository.getStudentInformation(feideAccessToken)
    const activeMembership = getActiveMembership(user)
    const applicableMembership = await findApplicableMembership(studyProgrammes, studySpecializations, courses)
    // We can only replace memberships if there is a new applicable one for the user
    if (!shouldReplaceMembership(activeMembership, applicableMembership) || applicableMembership === null) {
      return
    }
    await userRepository.createMembership(handle, user.id, applicableMembership)
  }

  async function findApplicableMembership(
    studyProgrammes: NTNUGroup[],
    studySpecializations: NTNUGroup[],
    courses: NTNUGroup[]
  ): Promise<MembershipWrite | null> {
    const masterProgramme = studyProgrammes.find((programme) => ONLINE_MASTER_PROGRAMMES.includes(programme.code))
    const bachelorProgramme = studyProgrammes.find((programme) => ONLINE_BACHELOR_PROGRAMMES.includes(programme.code))
    // Master programmes take precedence over bachelor programmes
    const relevantProgramme = masterProgramme ?? bachelorProgramme
    if (relevantProgramme === undefined) {
      return null
    }

    // We determine the newest study plan based on the length, so that we get the newest study plan available
    const studyProgramLength = masterProgramme !== undefined ? 2 : 3
    const studyStartYear = getAcademicStart(getCurrentUtc()).getUTCFullYear() - studyProgramLength
    const studyPlanCourses = await ntnuStudyPlanRepository.getStudyPlanCourses(relevantProgramme.code, studyStartYear)
    // We guesstimate which year of study the user is in, based on the courses they have taken and the courses in the
    // study plan.
    const estimatedStudyGrade = estimateStudyGrade(studyPlanCourses, courses)
    const estimatedStudyStart = addYears(getAcademicStart(getCurrentUtc()), -estimatedStudyGrade + 1)

    if (masterProgramme !== undefined) {
      const code = MembershipSpecializationSchema.catch("UNKNOWN").parse(studySpecializations?.[0].code)
      // If we have a new code that we have not seen, or for some other reason the code catches and returns UNKNOWN, we
      // emit a trace for it.
      if (code === "UNKNOWN") {
        logger.warn(
          "Caught unrecognized specialization code %s for specializations %o",
          studySpecializations?.[0].code,
          studySpecializations
        )
      }
      return {
        type: "MASTER_STUDENT",
        start: estimatedStudyStart,
        end: addYears(estimatedStudyStart, 2),
        specialization: code,
      }
    }

    return {
      type: "BACHELOR_STUDENT",
      start: estimatedStudyStart,
      end: addYears(estimatedStudyStart, 3),
      specialization: null,
    }
  }

  return {
    async findById(handle, userId) {
      const user = await userRepository.findById(handle, userId)
      if (user !== null) {
        return user
      }
      // If the user is not found, we will attempt to pull it from Auth0's user directory
      const response = await managementClient.users.get({ id: userId })
      if (response.status === 404) {
        return null
      }
      if (response.status !== 200) {
        logger.error(
          "Received non-200 OR non-404 response from Auth0 when fetching single user: %s (%s)",
          response.statusText,
          response.status
        )
        // TODO: Maybe this should not silently fail?
        return null
      }
      return await this.register(handle, userId)
    },
    async findByProfileSlug(handle, profileSlug) {
      return await userRepository.findByProfileSlug(handle, profileSlug)
    },
    async findUsers(handle, query, page) {
      return await userRepository.findMany(handle, query, page ?? { take: 20 })
    },
    async register(handle, subject) {
      const accessToken = await this.findFeideAccessTokenByUserId(subject)
      const user = await userRepository.register(handle, subject)
      // Because Auth0 has historically been the source of truth for user data, and holds the OpenID Connect profile,
      // we need to migrate over the data to the local database.
      const response = await managementClient.users.get({ id: subject })
      if (response.status !== 200) {
        throw new UserFetchError(subject, response.status, response.statusText)
      }

      // Slugs are unique, so if somebody has already sniped the app metadata registered username, we give them a new
      // random UUID for now. They can always update this later.
      const requestedSlug = UserWriteSchema.shape.profileSlug
        .catch(crypto.randomUUID())
        .parse(response.data.app_metadata?.username)
      const match = await this.findByProfileSlug(handle, requestedSlug)
      const slug = match !== null ? crypto.randomUUID() : requestedSlug

      const profile: UserWrite = {
        profileSlug: slug,
        name: response.data.name,
        email: response.data.email,
        imageUrl: response.data.picture,
        biography: response.data.app_metadata?.biography || null,
        phone: response.data.app_metadata?.phone || null,
        // NOTE: This field was called `allergies` in OnlineWeb 4, but today its called `dietaryRestrictions`.
        dietaryRestrictions: response.data.app_metadata?.allergies || null,
        // Gender is a standard OIDC claim, so we fallback to it if the app_metadata does not contain it.
        gender: response.data.app_metadata?.gender || response.data.gender || null,
      }
      await userRepository.update(handle, user.id, profile)

      // We can only refresh the membership if we have a valid access token, which only happens if the user has a
      // federated identity connection through Feide.
      if (accessToken !== null) {
        await refreshMembership(handle, accessToken, user)
      }
      return await this.getById(handle, user.id)
    },
    async getById(handle, userId) {
      const user = await this.findById(handle, userId)
      if (!user) {
        throw new UserNotFoundError(userId)
      }
      return user
    },
    async getByProfileSlug(handle, profileSlug) {
      const user = await this.findByProfileSlug(handle, profileSlug)
      if (!user) {
        throw new UserNotFoundError(profileSlug)
      }
      return user
    },
    async update(handle, userId, data) {
      return await userRepository.update(handle, userId, data)
    },
    async createMembership(handle, userId, data) {
      const user = await this.getById(handle, userId)
      return await userRepository.createMembership(handle, user.id, data)
    },
    async findFeideAccessTokenByUserId(userId) {
      const response = await managementClient.users.get({ id: userId })
      if (response.status !== 200) {
        throw new UserFetchError(userId, response.status, response.statusText)
      }
      const identity = response.data.identities.find(({ connection }) => connection === "FEIDE")
      return identity?.access_token ?? null
    },
  }
}

function shouldReplaceMembership(previous: Membership | null, next: MembershipWrite | null) {
  if (next === null) {
    return false
  }
  if (previous === null) {
    return true
  }
  if (previous.type === "BACHELOR_STUDENT" && next.type === "MASTER_STUDENT") {
    return true
  }
  return previous.type === "SOCIAL_MEMBER"
}

/**
 * Attempt to guess the current year of the provided user based on the courses they have taken and the courses that
 * are in their study plan.
 *
 * This algorithm is best-effort, and works by summing the credits of the courses that the user has taken, and the
 * credits granted by the courses in the study plan. It then estimates the grade level based on the number of credits
 *
 * NOTE: This does not take into account point reductions, or other edge cases, but should be a good enough
 * approximation for most.
 */
function estimateStudyGrade(studyPlanCourses: StudyplanCourse[], coursesTaken: NTNUGroup[]): number {
  // Sum up how much each course from the study plan indicates each grade level in the study plan
  // Example: { TDT4100: { "1": 7.5 } }, Object oriented programming indicates a first year (grade 1) with 7.5 credits indication strength
  const courseGradeIndications: Record<string, { grade: number; credits: number }> = {}
  for (const course of studyPlanCourses) {
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

    const yearSinceTakenCourse = differenceInYears(getAcademicStart(getCurrentUtc()), getAcademicStart(course.finished))
    const { grade, credits } = courseGradeIndications[course.code]
    const indicatedGrade = grade + yearSinceTakenCourse
    totalGradeIndications[indicatedGrade] = (totalGradeIndications[indicatedGrade] ?? 0) + credits
  }

  // Find the key with highest value - JS has ZERO nice utility functions :(
  return Number.parseInt(Object.entries(totalGradeIndications).reduce((a, b) => (a[1] > b[1] ? a : b))[0])
}
