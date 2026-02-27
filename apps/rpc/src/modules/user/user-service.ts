import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  isMembershipActive,
  type Membership,
  type MembershipId,
  type MembershipSpecialization,
  type MembershipWrite,
  USER_IMAGE_MAX_SIZE_KIB,
  type User,
  type UserFilterQuery,
  type UserId,
  type UserProfileSlug,
  type UserWrite,
  UserWriteSchema,
  findActiveMembership,
} from "@dotkomonline/types"
import { createS3PresignedPost, slugify, getNextSemesterStart, getCurrentSemesterStart } from "@dotkomonline/utils"
import { trace } from "@opentelemetry/api"
import type { ManagementClient } from "auth0"
import * as crypto from "node:crypto"
import { isDevelopmentEnvironment } from "../../configuration"
import { isSameDay } from "date-fns"
import { AlreadyExistsError, IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { FeideGroupsRepository, NTNUGroup } from "../feide/feide-groups-repository"
import {
  BACHELOR_FIRST_SEMESTER,
  BACHELOR_LAST_SEMESTER,
  MASTER_FIRST_SEMESTER,
  MASTER_LAST_SEMESTER,
  type MembershipService,
} from "./membership-service"
import type { UserRepository } from "./user-repository"

export interface UserService {
  register(handle: DBHandle, subject: string): Promise<User>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  /**
   * Find a user by their ID, or null if not found.
   *
   * This function will attempt to registrer the user if, and only if:
   * 1. The user is not found in the local database
   * 2. The user exists in Auth0's user directory.
   *
   * For this reason, the call might be slower than expected, as it makes network requests to Auth0 and potentially
   * Feide APIs if the user does not have an active membership (transitive call to UserService#discoverMembership).
   */
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  /**
   * Get a user by their ID.
   *
   * This function will attempt to registrer the user if, and only if:
   * 1. The user is not found in the local database
   * 2. The user exists in Auth0's user directory.
   *
   * For this reason, the call might be slower than expected, as it makes network requests to Auth0 and potentially
   * Feide APIs if the user does not have an active membership (transitive call to UserService#discoverMembership).
   *
   * @throws {NotFoundError} if the user is not found.
   */
  getById(handle: DBHandle, id: UserId): Promise<User>
  findByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  getByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User>
  findByWorkspaceUserIds(handle: DBHandle, workspaceUserIds: string[]): Promise<User[]>
  findUsers(handle: DBHandle, query: UserFilterQuery, page?: Pageable): Promise<User[]>

  /**
   * Attempt to discover an automatically granted membership from FEIDE.
   *
   * This function is only able to detect memberships if there is an active FEIDE access token available through a
   * federated FEIDE connection on the Auth0 user.
   *
   * This function should only be called if you actually want to registrer an automatically discovered membership.
   */
  discoverMembership(handle: DBHandle, userId: UserId): Promise<User>
  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
  updateMembership(handle: DBHandle, membershipId: MembershipId, membership: Partial<MembershipWrite>): Promise<User>
  deleteMembership(handle: DBHandle, membershipId: MembershipId): Promise<User>

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

  createFileUpload(
    handle: DBHandle,
    filename: string,
    contentType: string,
    userId: UserId,
    createdByUserId: UserId
  ): Promise<PresignedPost>
}

const ONLINE_MASTER_PROGRAMMES = ["MSIT", "MIT"]
const ONLINE_BACHELOR_PROGRAMMES = ["BIT"]

export function getUserService(
  userRepository: UserRepository,
  feideGroupsRepository: FeideGroupsRepository,
  managementClient: ManagementClient,
  membershipService: MembershipService,
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

    if (masterProgramme === undefined && bachelorProgramme === undefined) {
      return null
    }

    // Master degree always takes precedence over bachelor.
    const study = masterProgramme !== undefined ? "MASTER" : "BACHELOR"
    const estimatedSemester = membershipService.findEstimatedSemester(study, courses)

    // We grant memberships for one semester at a time. This has some trade-offs, and natural alternative end dates are:
    //   1. One semester (what we use)
    //   2. School year (one or two semesters--until next Autumn semester, earlier referred to as the next
    //      "academic start")
    //   3. Entire degree (three years for Bachelor's and two years for Master's)
    //
    // The longer each membership lasts, the fewer times you need to calculate the grade and other information. This
    // reduces the number of opportunities for wrong calculations, but also make the system less flexible. Sometimes
    // students take a Bachelor's degree over a span of two years. Other times they change study. We choose the tradeoff
    // where you have this flexibility, even though it costs us an increase in manual adjustments. You most often need
    // to manually adjust someone's membership if someone:
    //   a) Failed at least one of their courses a semester.
    //   b) Has a very weird study plan due to previous studies.
    //   c) Have been an exchange student and therefore not have done all their courses in the "correct" order
    //      (according to our system anyway), where they have a "hole" in their course list exposed to us.
    //
    // We have decided it is best to manually adjust the membership in any nonlinear case, versus trying to correct for
    // fairly common cases like exchange students automatically. We never want this heuristic to overestimate someone's
    // grade. This is because we deem it generally less beneficial to be in a lower grade (because in practice the older
    // students usually have priority for attendance), increasing their chances of reaching out to correct the error.
    const startDate = getCurrentSemesterStart()
    const endDate = getNextSemesterStart()

    if (study === "MASTER") {
      const code = getSpecializationFromCode(studySpecializations?.[0].code)

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
        start: startDate,
        end: endDate,
        specialization: code,
        semester: estimatedSemester,
      }
    }

    logger.info("Estimated end date for the bachelor's programme to be %s", endDate.toUTCString())
    return {
      type: "BACHELOR_STUDENT",
      start: startDate,
      end: endDate,
      specialization: null,
      semester: estimatedSemester,
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
          "Received non-200 OR non-404 response from Auth0 when fetching User(ID=%s): %s (%s)",
          userId,
          response.statusText,
          response.status
        )
        // TODO: Maybe this should not silently fail?
        return null
      }

      return await this.register(handle, userId)
    },

    async getById(handle, userId) {
      const user = await this.findById(handle, userId)

      if (!user) {
        throw new NotFoundError(`User(ID=${userId}) not found`)
      }

      return user
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

        // If the best active membership is KNIGHT, we attempt to discover a new membership for the user, in case they
        // can find a "better" membership this way.
        if (membership !== null && membership.type !== "KNIGHT") {
          return existingUser
        }

        // The membership of this user has expired since their last sign-in. Attempt to discover a need one.
        return this.discoverMembership(handle, userId)
      }

      logger.info("Detected first-time sign-in for User(ID=%s). Querying Auth0 for profile information", userId)

      // Get the profile from Auth0 and propagate the data to the database.
      const response = await managementClient.users.get({ id: userId })

      if (response.status !== 200) {
        throw new IllegalStateError(
          `Received HTTP ${response.status} (${response.statusText}) when fetching User(ID=${userId}) from Auth0`
        )
      }

      // Check if a user with the same email already exists (but with a different ID).
      // This happens when syncing prod data locally - prod users have different Auth0 subject IDs
      // than local Auth0 users with the same email. We handle this by updating the existing user's ID
      // to match the new Auth0 subject, preserving all their data and memberships.
      const email = response.data.email
      if (email && isDevelopmentEnvironment) {
        const existingUserByEmail = await handle.user.findFirst({
          where: { email },
          select: { id: true },
        })

        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          logger.info(
            "Found existing user with same email but different ID. Updating User(ID=%s) to new ID=%s",
            existingUserByEmail.id,
            userId
          )
          // Update the user's ID directly. PostgreSQL will cascade this to all FK references
          // because they all have ON UPDATE CASCADE.
          await handle.$executeRaw`UPDATE ow_user SET id = ${userId} WHERE id = ${existingUserByEmail.id}`

          // Return the user with the updated ID
          const updatedUser = await userRepository.findById(handle, userId)
          if (updatedUser !== null) {
            return this.discoverMembership(handle, userId)
          }
        }
      }

      await userRepository.register(handle, userId)

      const requestedSlug = UserWriteSchema.shape.profileSlug
        .catch(crypto.randomUUID())
        .parse(response.data.app_metadata?.username)

      // Profile slugs are unique, so if somebody has already the requested slug as their profile slug, we change the
      // requested slug to a new random UUID for now. The user can always update this later.
      const match = await this.findByProfileSlug(handle, requestedSlug)
      const slug = match !== null ? crypto.randomUUID() : requestedSlug

      const profile: UserWrite = {
        profileSlug: slug,
        name: response.data.name,
        email: response.data.email,
        imageUrl: response.data.picture,
        biography: response.data.app_metadata?.biography || null,
        phone: response.data.app_metadata?.phone || null,
        // This field was called `allergies` in OnlineWeb 4, but today it's called `dietaryRestrictions`.
        dietaryRestrictions: response.data.app_metadata?.allergies || null,
        // Gender is a standard OIDC claim, so we fall back to it if the app_metadata does not contain it.
        gender: response.data.app_metadata?.gender || response.data.gender || null,
        workspaceUserId: null,
      }

      const firstSignInUser = await userRepository.update(handle, userId, profile)

      return this.discoverMembership(handle, firstSignInUser.id)
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
              const studentInformation = await feideGroupsRepository.findStudentInformation(accessToken)

              if (studentInformation !== null) {
                const activeMembership = findActiveMembership(user)
                const applicableMembership = await findApplicableMembership(
                  studentInformation.studyProgrammes,
                  studentInformation.studySpecializations,
                  studentInformation.courses
                )

                // We can only replace memberships if there is a new applicable one for the user
                if (
                  applicableMembership !== null &&
                  shouldReplaceMembership(user.memberships, activeMembership, applicableMembership)
                ) {
                  // We make sure the membership is active before creating it. If it is not active, something has gone
                  // wrong in our logic.
                  if (isMembershipActive(applicableMembership)) {
                    logger.info("Discovered applicable membership for user %s: %o", user.id, applicableMembership)
                    await userRepository.createMembership(handle, user.id, applicableMembership)
                  } else {
                    logger.warn(
                      "Discovered and discarded invalid membership for user %s: %o",
                      user.id,
                      applicableMembership
                    )
                  }
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
      switch (data.type) {
        case "BACHELOR_STUDENT": {
          validateBachelorMembership(data)
          break
        }
        case "MASTER_STUDENT": {
          validateMasterMembership(data)
          break
        }
        case "SOCIAL_MEMBER": {
          validateSocialMembership(data)
          break
        }
        case "KNIGHT": {
          validateKnightMembership(data)
          break
        }
      }

      const user = await this.getById(handle, userId)

      return await userRepository.createMembership(handle, user.id, data)
    },

    async updateMembership(handle, membershipId, membership) {
      switch (membership.type) {
        case "BACHELOR_STUDENT": {
          validateBachelorMembership(membership)
          break
        }
        case "MASTER_STUDENT": {
          validateMasterMembership(membership)
          break
        }
        case "SOCIAL_MEMBER": {
          validateSocialMembership(membership)
          break
        }
        case "KNIGHT": {
          validateKnightMembership(membership)
          break
        }
      }

      return userRepository.updateMembership(handle, membershipId, membership)
    },

    async deleteMembership(handle, membershipId) {
      return userRepository.deleteMembership(handle, membershipId)
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

    async createFileUpload(handle, filename, contentType, userId, createdByUserId) {
      const user = await this.getById(handle, userId)

      const uuid = crypto.randomUUID()
      const key = `user/${user.id}/${Date.now()}-${uuid}-${slugify(filename)}`

      return await createS3PresignedPost(client, {
        bucket,
        key,
        maxSizeKiB: USER_IMAGE_MAX_SIZE_KIB,
        contentType,
        createdByUserId,
      })
    },
  }
}

/**
 * Determine if we should replace a previous membership with a new one.
 *
 * This is true if:
 * - There is no previous membership.
 * - The membership is not a duplicate of an existing membership (active or inactive).
 * - The previous membership is not active, and the next one is active.
 * - The next membership has a semester greater than or equal to the previous one.
 */
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

  if (!isMembershipActive(previous) && isMembershipActive(next)) {
    return true
  }

  // Returns true if the next semester is greater than or equal to the previous semester
  return (next.semester ?? -Infinity) - (previous.semester ?? -Infinity) >= 0
}

function areMembershipsEqual(a: Membership, b: MembershipWrite) {
  const isSameStart = isSameDay(a.start, b.start)
  const isSameEnd = (a.end === null && b.end === null) || (a.end !== null && b.end !== null && isSameDay(a.end, b.end))

  return (
    isSameStart && isSameEnd && a.specialization === b.specialization && a.type === b.type && a.semester === b.semester
  )
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

function validateBachelorMembership(membership: Partial<Membership>) {
  if (membership.specialization !== undefined && membership.specialization !== null) {
    throw new InvalidArgumentError("Bachelor memberships cannot have a Master specialization")
  }

  if (membership.semester !== undefined) {
    const isValidBachelorSemester =
      membership.semester !== null &&
      membership.semester >= BACHELOR_FIRST_SEMESTER &&
      membership.semester <= BACHELOR_LAST_SEMESTER

    if (!isValidBachelorSemester) {
      throw new InvalidArgumentError(
        `Bachelor memberships must have a semester value between ${BACHELOR_FIRST_SEMESTER} and ${BACHELOR_LAST_SEMESTER}`
      )
    }
  }

  if (membership.end === null) {
    throw new InvalidArgumentError("Bachelor memberships must have a value for end")
  }
}

function validateMasterMembership(membership: Partial<Membership>) {
  if (membership.specialization === null) {
    throw new InvalidArgumentError("Master memberships must have a Master specialization")
  }

  if (membership.semester !== undefined) {
    const isValidMasterSemester =
      membership.semester !== null &&
      membership.semester >= MASTER_FIRST_SEMESTER &&
      membership.semester <= MASTER_LAST_SEMESTER

    if (!isValidMasterSemester) {
      throw new InvalidArgumentError(
        `Master memberships must have a semester value between ${MASTER_FIRST_SEMESTER} and ${MASTER_LAST_SEMESTER}`
      )
    }
  }

  if (membership.end === null) {
    throw new InvalidArgumentError("Master memberships must have a value for end")
  }
}

function validateSocialMembership(membership: Partial<Membership>) {
  if (membership.specialization !== undefined && membership.specialization !== null) {
    throw new InvalidArgumentError("Social memberships cannot have a Master specialization")
  }

  if (membership.semester !== undefined) {
    const isValidBachelorSemester =
      membership.semester !== null &&
      membership.semester >= BACHELOR_FIRST_SEMESTER &&
      membership.semester <= BACHELOR_LAST_SEMESTER

    const isValidMasterSemester =
      membership.semester !== null &&
      membership.semester >= MASTER_FIRST_SEMESTER &&
      membership.semester <= MASTER_LAST_SEMESTER

    if (!isValidBachelorSemester && !isValidMasterSemester) {
      throw new InvalidArgumentError(
        `Social memberships must have a semester value between (${BACHELOR_FIRST_SEMESTER} and ${BACHELOR_LAST_SEMESTER}) OR (${MASTER_FIRST_SEMESTER} and ${MASTER_LAST_SEMESTER})`
      )
    }
  }

  if (membership.end === null) {
    throw new InvalidArgumentError("Social memberships must have a value for end")
  }
}

function validateKnightMembership(membership: Partial<Membership>) {
  if (membership.specialization !== undefined && membership.specialization !== null) {
    throw new InvalidArgumentError("Knight memberships cannot have a Master specialization")
  }

  if (membership.semester !== undefined && membership.semester !== null) {
    throw new InvalidArgumentError("Knight memberships cannot have a semester value")
  }

  if (membership.end !== undefined && membership.end !== null) {
    throw new InvalidArgumentError("Knight memberships are lifetime memberships and cannot have a value for end")
  }
}
