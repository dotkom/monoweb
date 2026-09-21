import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { User, UserId } from "./user"
import type { ManagementClient, PostIdentitiesRequest, PostIdentitiesRequestProviderEnum } from "auth0"
import type { AttendanceService } from "../event/attendance-service"
import type { GroupRepository } from "../group/group-repository"
import { mergeUsers } from "./user-merging"
import type { UserService } from "./user-service"
import { IllegalStateError, NotFoundError } from "../../error"

const CONNECTION_ID_REGEXP = /^con_[A-Za-z0-9]{16}$/

export interface LinkedIdentityMergeResult {
  user: User
  requiresReauthentication: boolean
}

export interface UserMergingService {
  /**
   * Merges two users into the survivor and consumes the consumer. The survivor's field values will take precedence over
   * the consumed user's values, except for memberships and group memberships, where we will attempt to keep all unique
   * non-duplicate memberships from both. If a field value is only present on the consumed user, it will be moved to the
   * survivor.
   *
   * IMPORTANT: The consumed user will be deleted after the merge.
   *
   * @see UserMergingService#linkAuth0IdentitiesWithToken for linking the Auth0 identities before merging the database
   * users.
   */
  merge(handle: DBHandle, survivorUserId: UserId, consumedUserId: UserId): Promise<User>
  /**
   * Merges database rows using {@link dataSurvivorUserId} as the source of profile data, then links Auth0 identities
   * with Username-Password as the Auth0 primary whenever either account has that connection.
   *
   * If the data survivor is a FEIDE-primary user and the other account is Username-Password, the surviving database
   * row is reassigned to the Username-Password Auth0 user id so the next login `sub` still matches.
   */
  mergeAndLinkIdentities(
    handle: DBHandle,
    dataSurvivorUserId: UserId,
    consumedUserId: UserId
  ): Promise<LinkedIdentityMergeResult>
  /**
   * This is for manually linking two identities (login methods) to the same user. This happens in Auth0. All identities
   * will be consolidated under the primary user.
   *
   * IMPORTANT: Be very careful with this function, as it would link a new login to an existing user, which could have
   * security implications if used incorrectly. Always make sure to verify the ownership of both accounts before linking
   * them.
   *
   * Both database users will still exist after this method is called. The secondary user will not be accessible by
   * authentication, and should be merged into the primary user.
   *
   * @see UserMergingService#merge for merging the database users after linking the Auth0 identities.
   */
  linkAuth0Identities(primaryUserId: UserId, secondaryUserId: UserId): Promise<void>
  /**
   * Links two Auth0 identities together using the `link_with` parameter. This is useful for self-service account
   * linking where the user has just authenticated with the secondary account.
   *
   * You can get the token from auth flow in `apps/web/api/auth/link-identity/`.
   *
   * Both database users will still exist after this method is called. The secondary user will not be accessible by
   * authentication, and should be merged into the primary user.
   *
   * @see UserMergingService#merge for merging the database users after linking the Auth0 identities.
   */
  linkAuth0IdentitiesWithToken(primaryUserId: UserId, secondaryIdToken: string): Promise<void>
}

/**
 * This exists to prioritize Username-Password-Authentication over FEIDE. This is desired because FEIDE manages their
 * user profile attributes, meaning we cannot change the email address for a user, as an example. If we prioritize
 * Username-Password-Authentication as the base identity, this is not an issue. For the user, this priotization is
 * invisible except for maybe changing user id.
 */
export function pickAuth0PrimaryUserId(
  dataSurvivorUserId: UserId,
  dataSurvivorHasUsernamePassword: boolean,
  consumedUserId: UserId,
  consumedHasUsernamePassword: boolean
): UserId {
  if (dataSurvivorHasUsernamePassword) {
    return dataSurvivorUserId
  }

  if (consumedHasUsernamePassword) {
    return consumedUserId
  }

  return dataSurvivorUserId
}

function pickAuth0SecondaryUserId(
  dataSurvivorUserId: UserId,
  consumedUserId: UserId,
  auth0PrimaryUserId: UserId
): UserId {
  if (auth0PrimaryUserId === dataSurvivorUserId) {
    return consumedUserId
  }

  return dataSurvivorUserId
}

export function getUserMergingService(
  userService: UserService,
  groupRepository: GroupRepository,
  attendanceService: AttendanceService,
  managementClient: ManagementClient,
  webManagementClient: ManagementClient
): UserMergingService {
  const logger = getLogger("user-merging-service")

  async function reassignUserId(handle: DBHandle, fromUserId: UserId, toUserId: UserId): Promise<void> {
    logger.info("Reassigning database User(ID=%s) to Auth0 primary User(ID=%s)", fromUserId, toUserId)

    // The ow_user audit trigger inserts a row attributed to app.current_user_id. That setting is the
    // logged-in subject, which this update is about to replace, so the insert would reference a missing user.
    await handle.$executeRaw`SELECT set_config('app.current_user_id', ${toUserId}, true)`
    await handle.$executeRaw`UPDATE ow_user SET id = ${toUserId} WHERE id = ${fromUserId}`
  }

  async function alignAuth0EmailWithDatabaseEmail(
    userId: UserId,
    databaseEmail: string | null,
    canUpdateAuth0Email: boolean
  ): Promise<void> {
    if (databaseEmail === null || !canUpdateAuth0Email) {
      return
    }

    const auth0Response = await managementClient.users.get({ id: userId })

    if (auth0Response.status !== 200) {
      throw new IllegalStateError(
        `Received HTTP ${auth0Response.status} (${auth0Response.statusText}) when fetching User(ID=${userId}) from Auth0`
      )
    }

    const currentAuth0Email = typeof auth0Response.data.email === "string" ? auth0Response.data.email.trim() : null

    if (currentAuth0Email === databaseEmail) {
      return
    }

    const updateResponse = await managementClient.users.update(
      {
        id: userId,
      },
      {
        email: databaseEmail,
        email_verified: true,
      }
    )

    if (updateResponse.status !== 200) {
      throw new IllegalStateError(
        `Received HTTP ${updateResponse.status} (${updateResponse.statusText}) when aligning Auth0 email for User(ID=${userId})`
      )
    }
  }

  return {
    async merge(handle, survivorUserId, consumedUserId) {
      logger.info("Merging consumed User(ID=%s) into survivor User(ID=%s)", consumedUserId, survivorUserId)

      const survivorUser = await userService.getById(handle, survivorUserId)
      const consumedUser = await userService.getById(handle, consumedUserId)

      await mergeUsers(handle, { groupRepository, attendanceService }, survivorUser, consumedUser)

      logger.info("Successfully merged consumed User(ID=%s) into survivor User(ID=%s)", consumedUserId, survivorUserId)

      return await userService.refreshFromAuth0(handle, survivorUserId)
    },

    async mergeAndLinkIdentities(handle, dataSurvivorUserId, consumedUserId) {
      const dataSurvivorConnections = await userService.getAuth0Connections(dataSurvivorUserId)
      const consumedConnections = await userService.getAuth0Connections(consumedUserId)

      const auth0PrimaryUserId = pickAuth0PrimaryUserId(
        dataSurvivorUserId,
        dataSurvivorConnections.hasUsernamePassword,
        consumedUserId,
        consumedConnections.hasUsernamePassword
      )

      const auth0SecondaryUserId = pickAuth0SecondaryUserId(dataSurvivorUserId, consumedUserId, auth0PrimaryUserId)
      const canUpdateAuth0Email = dataSurvivorConnections.hasUsernamePassword || consumedConnections.hasUsernamePassword

      logger.info(
        "Merging database User(ID=%s) as data survivor; Auth0 primary will be User(ID=%s)",
        dataSurvivorUserId,
        auth0PrimaryUserId
      )

      const dataSurvivorUser = await userService.getById(handle, dataSurvivorUserId)
      const consumedUser = await userService.getById(handle, consumedUserId)

      await mergeUsers(handle, { groupRepository, attendanceService }, dataSurvivorUser, consumedUser)

      const requiresReauthentication = dataSurvivorUserId !== auth0PrimaryUserId

      if (requiresReauthentication) {
        await reassignUserId(handle, dataSurvivorUserId, auth0PrimaryUserId)
      }

      await this.linkAuth0Identities(auth0PrimaryUserId, auth0SecondaryUserId)

      const refreshedUser = await userService.refreshFromAuth0(handle, auth0PrimaryUserId)
      let user = refreshedUser

      const dataSurvivorEmail = dataSurvivorUser.email

      if (dataSurvivorEmail !== null && refreshedUser.email !== dataSurvivorEmail) {
        await handle.user.update({
          where: {
            id: auth0PrimaryUserId,
          },
          data: {
            email: dataSurvivorEmail,
          },
        })

        user = { ...refreshedUser, email: dataSurvivorEmail }
      }

      await alignAuth0EmailWithDatabaseEmail(auth0PrimaryUserId, dataSurvivorUser.email, canUpdateAuth0Email)

      logger.info(
        "Successfully merged consumed User(ID=%s) into data survivor User(ID=%s) with Auth0 primary User(ID=%s)",
        consumedUserId,
        dataSurvivorUserId,
        auth0PrimaryUserId
      )

      return { user, requiresReauthentication }
    },

    async linkAuth0Identities(primaryUserId, secondaryUserId) {
      logger.info(
        "Linking authentication identities onto Auth0 primary User(ID=%s) from User(ID=%s)",
        primaryUserId,
        secondaryUserId
      )

      const secondaryUser = await managementClient.users.get({ id: secondaryUserId })

      const secondaryIdentity = secondaryUser.data.identities.find((identity) =>
        secondaryUserId.endsWith(identity.user_id)
      )

      if (secondaryIdentity === undefined) {
        throw new NotFoundError(`Auth0 identity for secondary User(ID=${secondaryUserId}) not found`)
      }

      const secondaryIdentityProvider = secondaryIdentity.provider as PostIdentitiesRequestProviderEnum
      const connectionId = secondaryIdentity.connection
      const requestBody: PostIdentitiesRequest = {
        provider: secondaryIdentityProvider,
        user_id: secondaryIdentity.user_id,
      }

      if (CONNECTION_ID_REGEXP.test(connectionId)) {
        requestBody.connection_id = connectionId
      }

      await managementClient.users.link(
        {
          id: primaryUserId,
        },
        requestBody
      )

      logger.info(
        "Successfully linked identities onto Auth0 primary User(ID=%s) from User(ID=%s)",
        primaryUserId,
        secondaryUserId
      )
    },

    async linkAuth0IdentitiesWithToken(primaryUserId, secondaryIdToken) {
      logger.info("Linking authentication identities for primary User(ID=%s) using secondary ID token", primaryUserId)

      // NOTE: We use the web management client here because the users.link endpoint requires the Management Client's
      // client_id to match the aud claim in the ID token, so we use the web client credentials.
      await webManagementClient.users.link({ id: primaryUserId }, { link_with: secondaryIdToken })

      logger.info("Successfully linked identities for primary User(ID=%s) using secondary ID token", primaryUserId)
    },
  }
}
