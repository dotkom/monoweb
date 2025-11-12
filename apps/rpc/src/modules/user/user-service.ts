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
  findActiveMembership,
  getAcademicStart,
} from "@dotkomonline/types"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { trace } from "@opentelemetry/api"
import type { ManagementClient } from "auth0"
import { addYears, differenceInYears, getYear, isBefore, isSameDay, subYears } from "date-fns"
import { AlreadyExistsError, IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { FeideGroupsRepository, NTNUGroup } from "../feide/feide-groups-repository"
import type { NTNUStudyPlanRepository, StudyplanCourse } from "../ntnu-study-plan/ntnu-study-plan-repository"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"
import { TZDate } from "@date-fns/tz"

export interface UserService {
  /**
   * Find a user by their ID, or null if not found.
   *
   * This function will attempt to register the user if, and only if:
   * 1. The user is not found in the local database
   * 2. The user exists in Auth0's user directory.
   *
   * For this reason, the call might be slower than expected, as it makes network requests to Auth0 and potentially
   * Feide APIs if the user does not have an active membership (transitive call to UserService#discoverMembership).
   */
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  findByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  findByWorkspaceUserIds(handle: DBHandle, workspaceUserIds: string[]): Promise<User[]>
  findUsers(handle: DBHandle, query: UserFilterQuery, page?: Pageable): Promise<User[]>
  getById(handle: DBHandle, id: UserId): Promise<User>
  getByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  register(handle: DBHandle, subject: string): Promise<User>
  /**
   * Attempt to discover an automatically granted membership from FEIDE.
   *
   * This function is only able to detect memberships if there is an active FEIDE access token available through a
   * federated FEIDE connection on the Auth0 user.
   *
   * This function should only be called if you actually want to register an automatically discovered membership.
   */
  discoverMembership(handle: DBHandle, userId: UserId): Promise<User>
  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
  updateMembership(handle: DBHandle, membershipId: MembershipId, membership: Partial<MembershipWrite>): Promise<User>
  deleteMembership(handle: DBHandle, membershipId: MembershipId): Promise<User>
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
    const studyStartYear = getAcademicStart(getCurrentUTC()).getUTCFullYear() - studyProgramLength
    const studyPlanCourses = await ntnuStudyPlanRepository.getStudyPlanCourses(relevantProgramme.code, studyStartYear)
    // We guesstimate which year of study the user is in, based on the courses they have taken and the courses in the
    // study plan.
    const estimatedStudyGrade = estimateStudyGrade(studyPlanCourses, courses)
    const estimatedStudyStart = subYears(getAcademicStart(getCurrentUTC()), estimatedStudyGrade - 1)
    logger.info(
      "Estimated study start date to be %s for a student in grade %d",
      estimatedStudyStart.toUTCString(),
      estimatedStudyGrade
    )

    // NOTE: We grant memberships for at most one year at a time. If you are granted membership after new-years, you
    // will only keep the membership until the start of the next school year.
    const now = getCurrentUTC()
    const firstAugust = new TZDate(getYear(now), 7, 1, 'Europe/Oslo')
    const isDueThisYear = isBefore(now, firstAugust)
    const endDate = isDueThisYear ? firstAugust : addYears(firstAugust, 1)

    // Master's programme takes precedence over bachelor's programme.
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

      logger.info("Estimated end date for the master's programme to be %s", endDate.toUTCString())
      return {
        type: "MASTER_STUDENT",
        start: estimatedStudyStart,
        end: endDate,
        specialization: code,
      }
    }

    logger.info("Estimated end date for the bachelor's programme to be %s", endDate.toUTCString())
    return {
      type: "BACHELOR_STUDENT",
      start: estimatedStudyStart,
      end: endDate,
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
    async findByWorkspaceUserIds(handle, workspaceUserIds) {
      return await userRepository.findByWorkspaceUserIds(handle, workspaceUserIds)
    },
    async findUsers(handle, query, page) {
      return await userRepository.findMany(handle, query, page ?? { take: 20 })
    },
    async register(handle, userId) {
      // NOTE: The register function here has a few responsibilities because of our data strategy:
      //
      // 1. The database is the source of truth, and is ALWAYS intended to be as such.
      // 2. Unfortunately, there was a period in time where Auth0 was the source of truth, most notably right after we
      //    adopted Auth0 and stopped using the `user` table in OnlineWeb 4 (NB: OnlineWeb4 is the OLD codebase, not
      //    this one!!!!)
      //
      // For this reason, we need to perform a couple checks, and a potential data migration.
      //
      // - Users who do NOT have a `ow_user` row (model User in schema.prisma) needs to have that created. The profile
      //   information for these users will come from Auth0, because Auth0 is where federated identities (FEIDE) end up
      //   sending the profile information. This is because OpenID Connect's /userinfo endpoint is automatically
      //   fetched by Auth0 when the Auth0 user is created.
      // - We also consider active memberships if the user does not already exist, or they do not have an active
      //   membership.
      const existingUser = await userRepository.findById(handle, userId)

      // If the user has an active membership, and the existing user is not null there is no more work for us to do,
      // and we can early exit. This is the happiest and fastest path of this function.
      if (existingUser !== null) {
        const membership = findActiveMembership(existingUser)
        if (membership !== null) {
          return existingUser
        }
        // The membership of this user has expired since their last sign-in. Attempt to discover a need one.
        return this.discoverMembership(handle, userId)
      }

      logger.info("Detected first-time sign-in for User(ID=%s). Querying Auth0 for profile information", userId)
      // profile from Auth0 and propagate the data to the database.
      const response = await managementClient.users.get({ id: userId })
      if (response.status !== 200) {
        throw new IllegalStateError(
          `Received HTTP ${response.status} (${response.statusText}) when fetching User(ID=${userId}) from Auth0`
        )
      }
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
        workspaceUserId: null,
      }
      const firstSignInUser = await userRepository.update(handle, userId, profile)
      return this.discoverMembership(handle, firstSignInUser.id)
    },
    async getById(handle, userId) {
      const user = await this.findById(handle, userId)
      if (!user) {
        throw new NotFoundError(`User(ID=${userId}) not found`)
      }
      return user
    },
    async getByProfileSlug(handle, profileSlug) {
      const user = await this.findByProfileSlug(handle, profileSlug)
      if (!user) {
        throw new NotFoundError(`User(ProfileSlug=${profileSlug}) not found`)
      }
      return user
    },
    async update(handle, userId, data) {
      const result = UserWriteSchema.partial().safeParse(data)

      if (!result.success) {
        // NOTE: We consider this safe to throw with the Zod error message
        throw new InvalidArgumentError(`Invalid payload for updating User(ID=${userId}): ${result.error.message}`)
      }

      if (data.profileSlug) {
        if (data.profileSlug !== slugify(data.profileSlug)) {
          throw new InvalidArgumentError(
            `User(ID=${userId}) cannot have ProfileSlug=${data.profileSlug} because it is not a valid slug`
          )
        }

        const existingUser = await this.findByProfileSlug(handle, data.profileSlug)

        if (existingUser && existingUser.id !== userId) {
          throw new AlreadyExistsError(
            `User(ID=${userId}) cannot have ProfileSlug=${data.profileSlug} because it is already taken`
          )
        }
      }

      return await userRepository.update(handle, userId, data)
    },
    async discoverMembership(handle, userId) {
      const accessToken = await this.findFeideAccessTokenByUserId(userId)
      const user = await this.getById(handle, userId)
      if (accessToken !== null) {
        // We spawn a separate OpenTelemetry span for the entire membership operation so that its easier to trace and
        // track the call stack and timings of the operation.
        await trace
          .getTracer("@dotkomonline/rpc/user-service")
          .startActiveSpan("UserService/DiscoverMembership", async (span) => {
            // According to Semantic Conventions (https://opentelemetry.io/docs/specs/semconv/registry/attributes/user/)
            // we should set the user.id attribute on the span to the user's ID. It makes it easier to trace them across
            // logs as well.
            span.setAttribute("user.id", user.id)
            try {
              const studentInformation = await feideGroupsRepository.getStudentInformation(accessToken)
              if (studentInformation !== null) {
                const activeMembership = findActiveMembership(user)
                const applicableMembership = await findApplicableMembership(
                  studentInformation.studyProgrammes,
                  studentInformation.studySpecializations,
                  studentInformation.courses
                )
                // We can only replace memberships if there is a new applicable one for the user
                if (
                  shouldReplaceMembership(user.memberships, activeMembership, applicableMembership) &&
                  applicableMembership !== null
                ) {
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
    async createMembership(handle, userId, data) {
      const user = await this.getById(handle, userId)
      return await userRepository.createMembership(handle, user.id, data)
    },
    async updateMembership(handle, membershipId, membership) {
      return userRepository.updateMembership(handle, membershipId, membership)
    },
    async deleteMembership(handle, membershipId) {
      return userRepository.deleteMembership(handle, membershipId)
    },
    async createAvatarUploadURL(handle, userId) {
      const user = await this.getById(handle, userId)

      // Arbitrarily set max size. This value is referenced in innstillinger/profil/form.tsx
      const maxSizeKB = 500
      const key = `avatar/${user.id}`

      logger.info(`Creating AWS S3 Presigned URL for User(ID=%s) at S3 address s3://${bucket}/${key}`, user.id)

      return await createPresignedPost(client, {
        Bucket: bucket,
        Key: key,
        Conditions: [["content-length-range", 0, maxSizeKB * 1024]],
      })
    },
    async findFeideAccessTokenByUserId(userId) {
      const response = await managementClient.users.get({ id: userId })
      if (response.status !== 200) {
        throw new IllegalStateError(
          `Received HTTP ${response.status} (${response.statusText}) when fetching User(ID=${userId}) from Auth0`
        )
      }
      const identity = response.data.identities.find(({ connection }) => connection === "FEIDE")
      return identity?.access_token ?? null
    },
  }
}

function shouldReplaceMembership(
  allMemberships: Membership[],
  previous: Membership | null,
  next: MembershipWrite | null
) {
  if (next === null) {
    return false
  }
  // Avoid creating duplicate memberships
  if (allMemberships.some((m) => areMembershipsEqual(m, next))) {
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

function areMembershipsEqual(a: Membership, b: MembershipWrite) {
  return (
    isSameDay(a.start, b.start) && isSameDay(a.end, b.end) && a.specialization === b.specialization && a.type === b.type
  )
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

    const yearSinceTakenCourse = differenceInYears(getAcademicStart(getCurrentUTC()), getAcademicStart(course.finished))
    const { grade, credits } = courseGradeIndications[course.code]
    const indicatedGrade = grade + yearSinceTakenCourse
    totalGradeIndications[indicatedGrade] = (totalGradeIndications[indicatedGrade] ?? 0) + credits
  }

  // Find the key with highest value - JS has ZERO nice utility functions :(
  return Number.parseInt(Object.entries(totalGradeIndications).reduce((a, b) => (a[1] > b[1] ? a : b), ["0", 0])[0])
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
