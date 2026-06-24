import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { User, UserId } from "./user"
import type { ManagementClient, PostIdentitiesRequestProviderEnum } from "auth0"
import type { AttendanceService } from "../event/attendance-service"
import type { GroupRepository } from "../group/group-repository"
import { mergeUsers } from "./user-merging"
import type { UserService } from "./user-service"
import { NotFoundError } from "../../error"

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

export function getUserMergingService(
  userService: UserService,
  groupRepository: GroupRepository,
  attendanceService: AttendanceService,
  managementClient: ManagementClient,
  webManagementClient: ManagementClient
): UserMergingService {
  const logger = getLogger("user-merging-service")

  return {
    async merge(handle, survivorUserId, consumedUserId) {
      logger.info("Merging consumed User(ID=%s) into survivor User(ID=%s)", consumedUserId, survivorUserId)

      const survivorUser = await userService.getById(handle, survivorUserId)
      const consumedUser = await userService.getById(handle, consumedUserId)

      await mergeUsers(handle, { groupRepository, attendanceService }, survivorUser, consumedUser)

      logger.info("Successfully merged consumed User(ID=%s) into survivor User(ID=%s)", consumedUserId, survivorUserId)

      return await userService.refreshFromAuth0(handle, survivorUserId)
    },

    async linkAuth0Identities(primaryUserId, secondaryUserId) {
      logger.info(
        "Linking authentication identities for survivor User(ID=%s) and consumed User(ID=%s)",
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

      await managementClient.users.link(
        {
          id: primaryUserId,
        },
        {
          provider: secondaryIdentityProvider,
          user_id: secondaryIdentity.user_id,
          connection_id: secondaryIdentity.connection,
        }
      )

      logger.info(
        "Successfully linked identities for survivor User(ID=%s) and consumed User(ID=%s)",
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
