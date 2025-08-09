import * as crypto from "node:crypto"
import type { S3Client } from "@aws-sdk/client-s3"
import { type PresignedPost, createPresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  type Membership,
  type MembershipId,
  type MembershipSpecialization,
  MembershipSpecializationSchema,
  type MembershipWrite,
  type User,
  type UserFilterQuery,
  type UserId,
  type UserProfileSlug,
  type UserWrite,
  UserWriteSchema,
  getAcademicStart,
  getActiveMembership,
} from "@dotkomonline/types"
import { getCurrentUtc, slugify } from "@dotkomonline/utils"
import { trace } from "@opentelemetry/api"
import type { ManagementClient } from "auth0"
import { addYears, differenceInYears, subYears } from "date-fns"
import type { Pageable } from "../../query"
import type { FeideGroupsRepository, NTNUGroup } from "../feide/feide-groups-repository"
import type { NTNUStudyPlanRepository, StudyplanCourse } from "../ntnu-study-plan/ntnu-study-plan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { UserFetchError, UserNotFoundError, UserUpdateError } from "./user-error"
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
  updateMembership(handle: DBHandle, membershipId: MembershipId, membership: Partial<MembershipWrite>): Promise<User>
  createAvatarUploadURL(handle: DBHandle, userId: UserId): Promise<PresignedPost>
  /**
   * Find the Feide federated access token for a user, if it exists.
   *
   * It is VERY important to note that this "access token" is not an OAuth2 access token that is verifiable against the
   * issuer, but instead the legacy Feide opaque token.
   *
   * See https://docs.feide.no/reference/tokens.html for more information on the token format. The one we receive here
   * is opaque with format like `afd4988b-a205-49f9-b2e0-03e00bb4b8c0`.
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
  managementClient: ManagementClient,
  client: S3Client,
  bucket: string
): UserService {
  const logger = getLogger("user-service")
  async function findApplicableMembership(
    studyProgrammes: NTNUGroup[],
    studySpecializations: NTNUGroup[],
    courses: NTNUGroup[]
  ): Promise<MembershipWrite | null> {
    const masterProgramme = studyProgrammes.find((programme) => ONLINE_MASTER_PROGRAMMES.includes(programme.code))
    const bachelorProgramme = studyProgrammes.find((programme) => ONLINE_BACHELOR_PROGRAMMES.includes(programme.code))
    logger.info("Discovered master programme: %o", masterProgramme)
    logger.info("Discovered bachelor programme: %o", bachelorProgramme)
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
    const estimatedStudyStart = subYears(getAcademicStart(getCurrentUtc()), estimatedStudyGrade - 1)
    logger.info(
      "Estimated study start date to be %s for a student in grade %d",
      estimatedStudyStart.toUTCString(),
      estimatedStudyGrade
    )

    if (masterProgramme !== undefined) {
      const code = MembershipSpecializationSchema.catch("UNKNOWN").parse(
        getSpecializationFromCode(studySpecializations?.[0].code)
      )
      // If we have a new code that we have not seen, or for some other reason the code catches and returns UNKNOWN, we
      // emit a trace for it.
      if (code === "UNKNOWN") {
        logger.warn(
          "Caught unrecognized specialization code %s for specializations %o",
          studySpecializations?.[0].code,
          studySpecializations
        )
      }
      // This is something of a bolder assumption, but we assume that if the user's estimated grade is greater than 3,
      // which is the duration of a bachelor programme, add 3 years to the estimated end date.
      const expectedEnd = estimatedStudyGrade > 3 ? addYears(estimatedStudyStart, 5) : addYears(estimatedStudyStart, 2)
      logger.info("Estimated end date for the master's programme to be %s", expectedEnd.toUTCString())
      return {
        type: "MASTER_STUDENT",
        start: estimatedStudyStart,
        end: expectedEnd,
        specialization: code,
      }
    }

    const expectedEnd = addYears(estimatedStudyStart, 3)
    logger.info("Estimated end date for the bachelor's programme to be %s", expectedEnd)
    return {
      type: "BACHELOR_STUDENT",
      start: estimatedStudyStart,
      end: expectedEnd,
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
    async register(handle, userId) {
      const accessToken = await this.findFeideAccessTokenByUserId(userId)
      const exisitingUser = await userRepository.findById(handle, userId)
      /// No access token for existing user means there is no Feide connection, and no more work to do.
      if (accessToken === null && exisitingUser !== null) {
        return exisitingUser
      }

      // Because Auth0 has historically been the source of truth for user data, and holds the OpenID Connect profile,
      // we need to migrate over the data to the local database.
      const response = await managementClient.users.get({ id: userId })
      if (response.status !== 200) {
        throw new UserFetchError(userId, response.status, response.statusText)
      }

      // We must prevent double registration (avoid two rows in the table) for a single physical person despite them
      // having both Auth0 and Feide identities. Further, we must also prevent updating an existing user with the claims
      // from the (potentially new) Feide identity, as this would reroll the profile slug and other data.
      let user: User
      if (exisitingUser === null) {
        await userRepository.register(handle, userId)
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
        user = await userRepository.update(handle, userId, profile)
      } else {
        user = exisitingUser
      }

      // We can only refresh the membership if we have a valid access token, which only happens if the user has a
      // federated identity connection through Feide.
      if (accessToken !== null) {
        // We spawn a separate OpenTelemetry span for the entire membership operation so that its easier to trace and
        // track the call stack and timings of the operation.
        await trace.getTracer("@dotkomonline/rpc/user-service").startActiveSpan("refreshMembership", async (span) => {
          // According to Semantic Conventions (https://opentelemetry.io/docs/specs/semconv/registry/attributes/user/)
          // we should set the user.id attribute on the span to the user's ID. It makes it easier to trace them across
          // logs as well.
          span.setAttribute("user.id", user.id)
          try {
            const studentInformation = await feideGroupsRepository.getStudentInformation(accessToken)
            if (studentInformation !== null) {
              const activeMembership = getActiveMembership(user)
              const applicableMembership = await findApplicableMembership(
                studentInformation.studyProgrammes,
                studentInformation.studySpecializations,
                studentInformation.courses
              )
              // We can only replace memberships if there is a new applicable one for the user
              if (shouldReplaceMembership(activeMembership, applicableMembership) && applicableMembership !== null) {
                logger.info("Discovered applicable membership for user %s: %o", user.id, applicableMembership)
                await userRepository.createMembership(handle, user.id, applicableMembership)
              }
            }
          } finally {
            span.end()
          }
        })
      }
      return user
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
      const result = UserWriteSchema.partial().safeParse(data)

      if (!result.success) {
        const errorPaths = result.error.errors.map((error) => error.path.join(".")).join(", ")
        throw new UserUpdateError(userId, `Invalid user data: ${result.error.message} at ${errorPaths}`)
      }

      if (data.profileSlug) {
        if (data.profileSlug !== slugify(data.profileSlug)) {
          throw new UserUpdateError(userId, `Profile slug ${data.profileSlug} is not a valid slug`)
        }

        const existingUser = await this.findByProfileSlug(handle, data.profileSlug)

        if (existingUser && existingUser.id !== userId) {
          throw new UserUpdateError(
            userId,
            `Profile slug ${data.profileSlug} is already taken by another user (${existingUser.id})`
          )
        }
      }

      return await userRepository.update(handle, userId, data)
    },
    async createMembership(handle, userId, data) {
      const user = await this.getById(handle, userId)
      return await userRepository.createMembership(handle, user.id, data)
    },
    async updateMembership(handle, membershipId, membership) {
      return userRepository.updateMembership(handle, membershipId, membership)
    },
    async createAvatarUploadURL(handle, userId) {
      const user = await this.getById(handle, userId)
      // There should be no reason for an image to be much larger than 500KB
      const maxSizeKB = 500
      const key = `/avatar/${user.id}`
      logger.info(`Creating AWS S3 Presigned URL for User(ID=%s) at S3 address s3://${bucket}/${key}`, user.id)
      return await createPresignedPost(client, {
        Bucket: bucket,
        Key: key,
        Conditions: [
          ["content-length-range", 0, maxSizeKB * 1024],
          ["eq", "$Content-Type", "image/jpeg"],
          ["eq", "$Content-Type", "image/png"],
          ["eq", "$Content-Type", "image/webp"],
        ],
      })
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

function getSpecializationFromCode(code: string): MembershipSpecialization {
  // Derived from 'MSIT.json' file which is pulled from Feide Groups API and the NTNU study plan.
  switch (code) {
    case "MSIT-AI":
      return "ARTIFICIAL_INTELLIGENCE"
    case "MSIT-DBS":
      return "DATABASE_AND_SEARCH"
    case "MSIT-IXDGLT":
      return "INTERACTION_DESIGN"
    case "MSIT-SWE":
      return "SOFTWARE_ENGINEERING"
  }
  return "UNKNOWN"
}
