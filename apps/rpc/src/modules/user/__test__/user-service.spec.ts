import type { S3Client } from "@aws-sdk/client-s3"
import type { DBHandle } from "@dotkomonline/db"
import { GenderSchema, type Membership, type User } from "@dotkomonline/types"
import type { ManagementClient } from "auth0"
import { mockDeep } from "vitest-mock-extended"
import type { FeideGroupsRepository } from "../../feide/feide-groups-repository"
import type { GroupRepository } from "../../group/group-repository"
import { mergeUsers as mergeUsersInDatabase } from "../user-merging"
import type { MembershipService } from "../membership-service"
import type { UserRepository } from "../user-repository"
import { getUserService } from "../user-service"
import { vi, expect, describe, afterEach, it } from "vitest"

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

describe("UserService", () => {
  const handle = {} as DBHandle
  const mergeUsersMock = vi.mocked(mergeUsersInDatabase)

  function createService() {
    const userRepository = mockDeep<UserRepository>()
    const feideGroupsRepository = mockDeep<FeideGroupsRepository>()
    const groupRepository = mockDeep<GroupRepository>()
    const managementClient = mockDeep<ManagementClient>()
    const webManagementClient = mockDeep<ManagementClient>()
    const membershipService = mockDeep<MembershipService>()
    const s3Client = mockDeep<S3Client>()

    const userService = getUserService(
      userRepository,
      feideGroupsRepository,
      groupRepository,
      managementClient,
      webManagementClient,
      membershipService,
      s3Client,
      "fake-aws-bucket"
    )

    return {
      userRepository,
      managementClient,
      userService,
    }
  }

  afterEach(() => {
    vi.clearAllMocks()
    mergeUsersMock.mockResolvedValue(undefined)
  })

  it("syncs the submitted signup name back to Auth0 when Auth0 still uses the email as name", async () => {
    const { userRepository, managementClient, userService } = createService()
    const createdUser = makeUser()
    const auth0User = {
      user_id: createdUser.id,
      email: createdUser.email,
      email_verified: true,
      name: createdUser.email,
      picture: null,
      app_metadata: { initial_full_name: createdUser.name },
      user_metadata: { full_name: createdUser.name },
      identities: [{ connection: "Username-Password-Authentication" }],
    }

    userRepository.findById.mockResolvedValueOnce(null).mockResolvedValue(createdUser)
    userRepository.register.mockResolvedValue(makeUser({ name: null }))
    userRepository.update.mockResolvedValue(createdUser)
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: auth0User,
    } as never)
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userService.register(handle, createdUser.id)

    expect(result.name).toBe(createdUser.name)
    expect(userRepository.update).toHaveBeenCalledWith(
      handle,
      createdUser.id,
      expect.objectContaining({ name: createdUser.name })
    )
    expect(managementClient.users.update).toHaveBeenCalledWith({ id: createdUser.id }, { name: createdUser.name })
  })

  it("repairs existing Auth0 profiles when the database already has the correct name", async () => {
    const { userRepository, managementClient, userService } = createService()
    const existingUser = makeUser({ memberships: [makeMembership()] })
    const auth0User = {
      user_id: existingUser.id,
      email: existingUser.email,
      email_verified: true,
      name: existingUser.email,
      picture: null,
      app_metadata: { initial_full_name: existingUser.name },
      user_metadata: { full_name: existingUser.name },
      identities: [{ connection: "Username-Password-Authentication" }],
    }

    userRepository.findById.mockResolvedValue(existingUser)
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: auth0User,
    } as never)
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userService.register(handle, existingUser.id)

    expect(result).toBe(existingUser)
    expect(userRepository.update).not.toHaveBeenCalled()
    expect(managementClient.users.update).toHaveBeenCalledWith({ id: existingUser.id }, { name: existingUser.name })
  })

  it("syncs the FEIDE name immediately after merging linked identities", async () => {
    const { userRepository, managementClient, userService } = createService()
    const survivorUser = makeUser({ id: "auth0|primary-user", name: "Original Name", email: "primary@example.com" })
    const consumedUser = makeUser({ id: "oauth2|feide-user", name: "FEIDE Name", email: "student@ntnu.no" })
    const mergedUser = makeUser({ id: survivorUser.id, name: survivorUser.name, email: survivorUser.email })
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

    userRepository.findById
      .mockResolvedValueOnce(survivorUser)
      .mockResolvedValueOnce(consumedUser)
      .mockResolvedValueOnce(mergedUser)
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

    const result = await userService.mergeUsers(handle, survivorUser.id, consumedUser.id)

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
    const { userRepository, managementClient, userService } = createService()
    const survivorUser = makeUser({ id: "auth0|primary-user", name: "Admin Override", email: "primary@example.com" })
    const consumedUser = makeUser({ id: "oauth2|feide-user", name: "FEIDE Name", email: "student@ntnu.no" })
    const mergedUser = makeUser({ id: survivorUser.id, name: survivorUser.name, email: survivorUser.email })
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

    userRepository.findById
      .mockResolvedValueOnce(survivorUser)
      .mockResolvedValueOnce(consumedUser)
      .mockResolvedValueOnce(mergedUser)
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: auth0User,
    } as never)
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userService.mergeUsers(handle, survivorUser.id, consumedUser.id)

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
})
