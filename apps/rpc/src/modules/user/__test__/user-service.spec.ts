import type { S3Client } from "@aws-sdk/client-s3"
import type { DBHandle } from "@dotkomonline/db"
import { GenderSchema, type Membership, type User } from "../user"
import type { ManagementClient } from "auth0"
import { mockDeep } from "vitest-mock-extended"
import type { FeideGroupsRepository } from "../../feide/feide-groups-repository"
import type { MembershipService } from "../membership-service"
import type { UserRepository } from "../user-repository"
import { getUserService } from "../user-service"
import { vi, expect, describe, afterEach, it } from "vitest"

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
  const handle = {
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  } as unknown as DBHandle

  function createService() {
    const userRepository = mockDeep<UserRepository>()
    const feideGroupsRepository = mockDeep<FeideGroupsRepository>()
    const managementClient = mockDeep<ManagementClient>()
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

    return {
      userRepository,
      managementClient,
      userService,
    }
  }

  function mockAuth0UserGet(
    managementClient: ReturnType<typeof createService>["managementClient"],
    identities: Array<{ connection: string; provider: string }>,
    overrides: Record<string, unknown> = {}
  ) {
    managementClient.users.get.mockResolvedValue({
      status: 200,
      statusText: "OK",
      data: {
        identities,
        ...overrides,
      },
    } as never)
  }

  afterEach(() => {
    vi.clearAllMocks()
    vi.mocked(handle.user.findFirst).mockResolvedValue(null)
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

  it("updates contact email in the database for Feide users because Auth0 cannot change federated emails", async () => {
    const { userRepository, managementClient, userService } = createService()
    const feideUser = makeUser({
      id: "oauth2|FEIDE|4ca2080c-537f-4426-bb7f-ca22b15df05a",
      email: "old@stud.ntnu.no",
    })
    const newEmail = "new@example.com"

    userRepository.findById.mockResolvedValue(feideUser)
    userRepository.update.mockResolvedValue({ ...feideUser, email: newEmail })
    mockAuth0UserGet(managementClient, [{ connection: "FEIDE", provider: "oauth2" }])

    const result = await userService.requestEmailChange(handle, feideUser.id, newEmail)

    expect(result).toEqual({ verificationSent: false })
    expect(userRepository.update).toHaveBeenCalledWith(handle, feideUser.id, { email: newEmail })
    expect(managementClient.users.update).not.toHaveBeenCalled()
  })

  it("asks Auth0 to verify the new email for database users without updating the database yet", async () => {
    const { userRepository, managementClient, userService } = createService()
    const databaseUser = makeUser()
    const newEmail = "new@example.com"

    userRepository.findById.mockResolvedValue(databaseUser)
    mockAuth0UserGet(managementClient, [{ connection: "Username-Password-Authentication", provider: "auth0" }])
    managementClient.users.update.mockResolvedValue({
      status: 200,
      statusText: "OK",
    } as never)

    const result = await userService.requestEmailChange(handle, databaseUser.id, newEmail)

    expect(result).toEqual({ verificationSent: true })
    expect(userRepository.update).not.toHaveBeenCalled()
    expect(managementClient.users.update).toHaveBeenCalledWith(
      { id: databaseUser.id },
      { email: newEmail, email_verified: false, verify_email: true }
    )
  })

  it("does not overwrite a Feide user's database email when Auth0 still has the identity-provider email", async () => {
    const { userRepository, managementClient, userService } = createService()
    const feideUser = makeUser({
      id: "oauth2|FEIDE|4ca2080c-537f-4426-bb7f-ca22b15df05a",
      email: "personal@example.com",
      memberships: [makeMembership({ userId: "oauth2|FEIDE|4ca2080c-537f-4426-bb7f-ca22b15df05a" })],
    })

    userRepository.findById.mockResolvedValue(feideUser)
    mockAuth0UserGet(managementClient, [{ connection: "FEIDE", provider: "oauth2" }], {
      user_id: feideUser.id,
      email: "old@stud.ntnu.no",
      email_verified: true,
      name: feideUser.name,
    })

    const result = await userService.syncEmailFromAuth0(handle, feideUser.id)

    expect(result).toBe(feideUser)
    expect(userRepository.update).not.toHaveBeenCalled()
  })
})
