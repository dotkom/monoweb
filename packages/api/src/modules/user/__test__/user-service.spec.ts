import { describe, vi } from "vitest"

import { Kysely } from "kysely"
import { PrivacyPermissions } from "@dotkomonline/types"
import { PrivacyPermissionsRepositoryImpl } from "./../privacy-permissions-repository"
import { UserRepositoryImpl } from "./../user-repository"
import { UserServiceImpl } from "../user-service"
import { clerkClient } from "@clerk/nextjs/server"
import { randomUUID } from "crypto"

const privacyPermissionsPayload: Omit<PrivacyPermissions, "userId"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  profileVisible: true,
  usernameVisible: true,
  emailVisible: false,
  phoneVisible: false,
  addressVisible: false,
  attendanceVisible: false,
}

describe("UserService", () => {
  vi.mock("@clerk/nextjs/server", async () => {
    return { clerkClient: {} }
  })

  const db = vi.mocked(Kysely.prototype)
  const userRepository = new UserRepositoryImpl(db)
  const privacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const clerk = vi.mocked(clerkClient)
  const userService = new UserServiceImpl(userRepository, privacyPermissionsRepository, clerk)

  const userId = randomUUID()

  it("get privacy permissions for a given user", async () => {
    vi.spyOn(privacyPermissionsRepository, "getByUserId").mockResolvedValueOnce({
      userId,
      ...privacyPermissionsPayload,
    })

    expect(await userService.getPrivacyPermissionsByUserId(userId)).toEqual({
      userId,
      ...privacyPermissionsPayload,
    })
    expect(privacyPermissionsRepository.getByUserId).toHaveBeenCalledWith(userId)
  })

  it("get privacy permissions for a given user, but creates instead as it doesnt exist", async () => {
    vi.spyOn(privacyPermissionsRepository, "getByUserId").mockResolvedValueOnce(undefined)
    vi.spyOn(privacyPermissionsRepository, "create").mockResolvedValueOnce({
      userId,
      ...privacyPermissionsPayload,
    })

    expect(await userService.getPrivacyPermissionsByUserId(userId)).toEqual({
      userId,
      ...privacyPermissionsPayload,
    })
    expect(privacyPermissionsRepository.getByUserId).toHaveBeenCalledWith(userId)
    expect(privacyPermissionsRepository.create).toHaveBeenCalledWith({ userId })
  })

  it("update privacy permissions for a given user", async () => {
    vi.spyOn(privacyPermissionsRepository, "update").mockResolvedValueOnce({
      userId,
      ...privacyPermissionsPayload,
      emailVisible: true,
    })

    expect(await userService.updatePrivacyPermissionsForUserId(userId, { emailVisible: true })).toEqual({
      userId,
      ...privacyPermissionsPayload,
      emailVisible: true,
    })
    expect(privacyPermissionsRepository.update).toHaveBeenCalledWith(userId, { emailVisible: true })
  })

  it("update privacy permissions for a given user, but creates instead as it doesnt exist", async () => {
    vi.spyOn(privacyPermissionsRepository, "update").mockResolvedValueOnce(undefined)
    vi.spyOn(privacyPermissionsRepository, "create").mockResolvedValueOnce({
      userId,
      ...privacyPermissionsPayload,
      emailVisible: true,
    })

    expect(await userService.updatePrivacyPermissionsForUserId(userId, { emailVisible: true })).toEqual({
      userId,
      ...privacyPermissionsPayload,
      emailVisible: true,
    })
    expect(privacyPermissionsRepository.update).toHaveBeenCalledWith(userId, { emailVisible: true })
    expect(privacyPermissionsRepository.create).toHaveBeenCalledWith({ userId, emailVisible: true })
  })
})
