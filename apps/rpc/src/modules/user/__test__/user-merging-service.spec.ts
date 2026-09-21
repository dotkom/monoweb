import type { S3Client } from "@aws-sdk/client-s3"
import type { DBHandle } from "@dotkomonline/db"
import { GenderSchema, type Membership, type User } from "../user"
import type { ManagementClient } from "auth0"
import { mockDeep } from "vitest-mock-extended"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { AttendanceService } from "../../event/attendance-service"
import type { FeideGroupsRepository } from "../../feide/feide-groups-repository"
import type { GroupRepository } from "../../group/group-repository"
import type { MembershipService } from "../membership-service"
import { getUserMergingService, pickAuth0PrimaryUserId } from "../user-merging-service"
import type { UserRepository } from "../user-repository"
import { mergeUsers as mergeUsersInDatabase } from "../user-merging"
import { getUserService } from "../user-service"

vi.mock("../user-merging", () => ({
  mergeUsers: vi.fn().mockResolvedValue(undefined),
}))

function makeUser(overrides: Partial<User> = {}): User {
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: "auth0|user-123",
    username: "test-user",
    name: "Correct Name",
    email: "user@example.com",
    imageUrl: null,
    biography: null,
    phone: null,
    dietaryRestrictions: null,
    gender: GenderSchema.enum.UNKNOWN,
    workspaceUserId: null,
    memberships: [],
    ntnuUsername: null,
    flags: [],
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    ...overrides,
  }
}

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "membership-1",
    type: "SOCIAL_MEMBER",
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T00:00:00.000Z"),
    specialization: null,
    semester: 1,
    userId: "auth0|user-123",
    ...overrides,
  }
}

describe("UserMergingService", () => {
  const handle = {} as DBHandle
  const mergeUsersMock = vi.mocked(mergeUsersInDatabase)

  function createService() {
    const userRepository = mockDeep<UserRepository>()
    const feideGroupsRepository = mockDeep<FeideGroupsRepository>()
    const groupRepository = mockDeep<GroupRepository>()
    const attendanceService = mockDeep<AttendanceService>()
    const managementClient = mockDeep<ManagementClient>()
    const webManagementClient = mockDeep<ManagementClient>()
    const membershipService = mockDeep<MembershipService>()
    const s3Client = mockDeep<S3Client>()

    const userService = getUserService(
      userRepository,
      feideGroupsRepository,
      managementClient,
      membershipService,
      s3Client,
      "fake-aws-bucket"
    )

    const userMergingService = getUserMergingService(
      userService,
      groupRepository,
      attendanceService,
      managementClient,
      webManagementClient
    )

    return {
      userRepository,
      managementClient,
      userMergingService,
    }
  }

  afterEach(() => {
    vi.clearAllMocks()
    mergeUsersMock.mockResolvedValue(undefined)
  })

  it("syncs the FEIDE name immediately after merging linked identities", async () => {
    const { userRepository, managementClient, userMergingService } = createService()
    const survivorUser = makeUser({
      id: "auth0|primary-user",
      name: "Original Name",
      email: "primary@example.com",
      memberships: [makeMembership()],
    })
    const consumedUser = makeUser({ id: "oauth2|feide-user", name: "FEIDE Name", email: "student@ntnu.no" })
    const syncedUser = makeUser({ id: survivorUser.id, name: "FEIDE Name", email: survivorUser.email })
    const auth0User = {
      user_id: survivorUser.id,
      email: survivorUser.email,
      email_verified: true,
      name: survivorUser.email,
      picture: null,
      app_metadata: { initial_full_name: survivorUser.name },
      user_metadata: { full_name: survivorUser.name },
      identities: [
        { connection: "Username-Password-Authentication" },
        { connection: "FEIDE", profileData: { name: "FEIDE Name" } },
      ],
    }

    userRepository.findById.mockImplementation(async (_handle, id) => {
      if (id === survivorUser.id) return survivorUser
      if (id === consumedUser.id) return consumedUser
      return null
    })
    userRepository.update.mockResolvedValue(syncedUser)
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: auth0User,
    } as never)
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userMergingService.merge(handle, survivorUser.id, consumedUser.id)

    expect(mergeUsersMock).toHaveBeenCalledWith(handle, expect.anything(), survivorUser, consumedUser)
    expect(userRepository.update).toHaveBeenCalledWith(handle, survivorUser.id, { name: "FEIDE Name" })
    expect(managementClient.users.update).toHaveBeenNthCalledWith(
      1,
      { id: survivorUser.id },
      { app_metadata: { initial_full_name: survivorUser.name, feide_full_name: "FEIDE Name" } }
    )
    expect(managementClient.users.update).toHaveBeenNthCalledWith(2, { id: survivorUser.id }, { name: "FEIDE Name" })
    expect(result.name).toBe("FEIDE Name")
  })

  it("does not overwrite manual names when FEIDE is linked during merge", async () => {
    const { userRepository, managementClient, userMergingService } = createService()
    const survivorUser = makeUser({
      id: "auth0|primary-user",
      name: "Admin Override",
      email: "primary@example.com",
      memberships: [makeMembership()],
    })
    const consumedUser = makeUser({ id: "oauth2|feide-user", name: "FEIDE Name", email: "student@ntnu.no" })
    const auth0User = {
      user_id: survivorUser.id,
      email: survivorUser.email,
      email_verified: true,
      name: survivorUser.email,
      picture: null,
      app_metadata: { initial_full_name: "Original Name" },
      user_metadata: { full_name: "Original Name" },
      identities: [
        { connection: "Username-Password-Authentication" },
        { connection: "FEIDE", profileData: { name: "FEIDE Name" } },
      ],
    }

    userRepository.findById.mockImplementation(async (_handle, id) => {
      if (id === survivorUser.id) return survivorUser
      if (id === consumedUser.id) return consumedUser
      return null
    })
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: auth0User,
    } as never)
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userMergingService.merge(handle, survivorUser.id, consumedUser.id)

    expect(userRepository.update).not.toHaveBeenCalled()
    expect(managementClient.users.update).toHaveBeenNthCalledWith(
      1,
      { id: survivorUser.id },
      { app_metadata: { initial_full_name: "Original Name", feide_full_name: "FEIDE Name" } }
    )
    expect(managementClient.users.update).toHaveBeenNthCalledWith(
      2,
      { id: survivorUser.id },
      { name: survivorUser.name }
    )
    expect(result.name).toBe(survivorUser.name)
  })

  it("keeps the current user's database data and makes Username-Password the Auth0 primary", async () => {
    const transactionHandle = mockDeep<DBHandle>()
    const { userRepository, managementClient, userMergingService } = createService()
    const feideUser = makeUser({
      id: "oauth2|FEIDE|feide-user",
      name: "FEIDE Name",
      email: "student@ntnu.no",
      memberships: [makeMembership({ userId: "oauth2|FEIDE|feide-user" })],
    })
    const passwordUser = makeUser({
      id: "auth0|password-user",
      name: "Password Name",
      email: "personal@example.com",
    })
    const rekeyedUser = makeUser({
      ...feideUser,
      id: passwordUser.id,
    })
    const feideAuth0User = {
      user_id: feideUser.id,
      email: feideUser.email,
      email_verified: true,
      name: feideUser.name,
      identities: [
        { connection: "FEIDE", provider: "oauth2", user_id: "feide-user", profileData: { name: feideUser.name } },
      ],
    }
    const passwordAuth0User = {
      user_id: passwordUser.id,
      email: passwordUser.email,
      email_verified: true,
      name: passwordUser.name,
      app_metadata: {},
      user_metadata: {},
      identities: [
        { connection: "Username-Password-Authentication", provider: "auth0", user_id: "password-user" },
        { connection: "FEIDE", provider: "oauth2", user_id: "feide-user", profileData: { name: feideUser.name } },
      ],
    }

    userRepository.findById
      .mockResolvedValueOnce(feideUser)
      .mockResolvedValueOnce(passwordUser)
      .mockResolvedValue(rekeyedUser)
    userRepository.update.mockResolvedValue(rekeyedUser)
    managementClient.users.get.mockImplementation(async ({ id }) => {
      if (id === feideUser.id) {
        return { status: 200, statusText: "OK", data: feideAuth0User }
      }

      return { status: 200, statusText: "OK", data: passwordAuth0User }
    })
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)
    managementClient.users.link.mockResolvedValue({} as never)

    const result = await userMergingService.mergeAndLinkIdentities(transactionHandle, feideUser.id, passwordUser.id)

    expect(mergeUsersMock).toHaveBeenCalledWith(transactionHandle, expect.anything(), feideUser, passwordUser)
    expect(transactionHandle.$executeRaw).toHaveBeenCalledTimes(2)
    expect(managementClient.users.link).toHaveBeenCalledWith(
      { id: passwordUser.id },
      { provider: "oauth2", user_id: "feide-user" }
    )
    expect(managementClient.users.update).toHaveBeenCalledWith(
      { id: passwordUser.id },
      { email: feideUser.email, email_verified: true }
    )
    expect(result.requiresReauthentication).toBe(true)
    expect(result.user.id).toBe(passwordUser.id)
    expect(result.user.email).toBe(feideUser.email)
    expect(result.user.name).toBe(feideUser.name)
  })

  it("does not reassign the user id when the current user is already Username-Password", async () => {
    const transactionHandle = mockDeep<DBHandle>()
    const { userRepository, managementClient, userMergingService } = createService()
    const passwordUser = makeUser({
      id: "auth0|password-user",
      name: "Password Name",
      email: "personal@example.com",
      memberships: [makeMembership({ userId: "auth0|password-user" })],
    })
    const feideUser = makeUser({
      id: "oauth2|FEIDE|feide-user",
      name: "FEIDE Name",
      email: "student@ntnu.no",
    })
    const feideAuth0User = {
      user_id: feideUser.id,
      email: feideUser.email,
      email_verified: true,
      name: feideUser.name,
      identities: [
        { connection: "FEIDE", provider: "oauth2", user_id: "feide-user", profileData: { name: feideUser.name } },
      ],
    }
    const passwordAuth0User = {
      user_id: passwordUser.id,
      email: passwordUser.email,
      email_verified: true,
      name: passwordUser.name,
      app_metadata: { initial_full_name: passwordUser.name },
      user_metadata: { full_name: passwordUser.name },
      identities: [
        { connection: "Username-Password-Authentication", provider: "auth0", user_id: "password-user" },
        { connection: "FEIDE", provider: "oauth2", user_id: "feide-user", profileData: { name: feideUser.name } },
      ],
    }

    userRepository.findById.mockImplementation(async (_handle, id) => {
      if (id === passwordUser.id) {
        return passwordUser
      }

      if (id === feideUser.id) {
        return feideUser
      }

      return null
    })
    userRepository.update.mockResolvedValue(passwordUser)
    managementClient.users.get.mockImplementation(async ({ id }) => {
      if (id === feideUser.id) {
        return { status: 200, statusText: "OK", data: feideAuth0User }
      }

      return { status: 200, statusText: "OK", data: passwordAuth0User }
    })
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)
    managementClient.users.link.mockResolvedValue({} as never)

    const result = await userMergingService.mergeAndLinkIdentities(transactionHandle, passwordUser.id, feideUser.id)

    expect(mergeUsersMock).toHaveBeenCalledWith(transactionHandle, expect.anything(), passwordUser, feideUser)
    expect(transactionHandle.$executeRaw).not.toHaveBeenCalled()
    expect(managementClient.users.link).toHaveBeenCalledWith(
      { id: passwordUser.id },
      { provider: "oauth2", user_id: "feide-user" }
    )
    expect(result.requiresReauthentication).toBe(false)
    expect(result.user.id).toBe(passwordUser.id)
  })
})

describe("pickAuth0PrimaryUserId", () => {
  it("keeps the data survivor when it already has Username-Password", () => {
    expect(pickAuth0PrimaryUserId("auth0|current", true, "oauth2|FEIDE|other", false)).toBe("auth0|current")
  })

  it("prefers the consumed Username-Password user when the data survivor is FEIDE-only", () => {
    expect(pickAuth0PrimaryUserId("oauth2|FEIDE|current", false, "auth0|other", true)).toBe("auth0|other")
  })

  it("keeps the data survivor when neither account has Username-Password", () => {
    expect(pickAuth0PrimaryUserId("oauth2|FEIDE|current", false, "oauth2|FEIDE|other", false)).toBe(
      "oauth2|FEIDE|current"
    )
  })
})
