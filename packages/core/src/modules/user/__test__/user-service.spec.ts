import { randomUUID } from "crypto"
import { describe, vi } from "vitest"
import { Kysely } from "kysely"
import { type NotificationPermissions, type PrivacyPermissions } from "@dotkomonline/types"
import { PrivacyPermissionsRepositoryImpl } from "../privacy-permissions-repository"
import { UserRepositoryImpl } from "../user-repository"
import { UserServiceImpl } from "../user-service"
import { NotificationPermissionsRepositoryImpl } from "../notification-permissions-repository"
import { Auth0IDPRepositoryImpl, Auth0Repository } from "../../../lib/auth0-repository"
import { ManagementClient } from "auth0"

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

const notificationPermissionsPayload: Omit<NotificationPermissions, "userId"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  applications: true,
  newArticles: true,
  standardNotifications: true,
  groupMessages: true,
  markRulesUpdates: true, // should not be able to disable
  receipts: true,
  registrationByAdministrator: true,
  registrationStart: true,
}

describe("UserService", () => {
  const db = vi.mocked(Kysely.prototype)
  const userRepository = new UserRepositoryImpl(db)
  const privacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository = new NotificationPermissionsRepositoryImpl(db)

  const auth0Client = vi.mocked(ManagementClient.prototype)
  const idpRepo = new Auth0IDPRepositoryImpl(auth0Client)
  const userService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    idpRepo
  )

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

  // Notification permissions

  it("get notification permissions for a given user", async () => {
    vi.spyOn(notificationPermissionsRepository, "getByUserId").mockResolvedValueOnce({
      userId,
      ...notificationPermissionsPayload,
    })

    expect(await userService.getNotificationPermissionsByUserId(userId)).toEqual({
      userId,
      ...notificationPermissionsPayload,
    })
    expect(notificationPermissionsRepository.getByUserId).toHaveBeenCalledWith(userId)
  })

  it("get notification permissions for a given user, but creates instead as it doesnt exist", async () => {
    vi.spyOn(notificationPermissionsRepository, "getByUserId").mockResolvedValueOnce(undefined)
    vi.spyOn(notificationPermissionsRepository, "create").mockResolvedValueOnce({
      userId,
      ...notificationPermissionsPayload,
    })

    expect(await userService.getNotificationPermissionsByUserId(userId)).toEqual({
      userId,
      ...notificationPermissionsPayload,
    })
    expect(notificationPermissionsRepository.getByUserId).toHaveBeenCalledWith(userId)
    expect(notificationPermissionsRepository.create).toHaveBeenCalledWith({ userId })
  })

  it("update notification permissions for a given user", async () => {
    vi.spyOn(notificationPermissionsRepository, "update").mockResolvedValueOnce({
      userId,
      ...notificationPermissionsPayload,
      applications: true,
    })

    expect(await userService.updateNotificationPermissionsForUserId(userId, { applications: true })).toEqual({
      userId,
      ...notificationPermissionsPayload,
      applications: true,
    })
    expect(notificationPermissionsRepository.update).toHaveBeenCalledWith(userId, { applications: true })
  })

  it("update notification permissions for a given user, but creates instead as it doesnt exist", async () => {
    vi.spyOn(notificationPermissionsRepository, "update").mockResolvedValueOnce(undefined)
    vi.spyOn(notificationPermissionsRepository, "create").mockResolvedValueOnce({
      userId,
      ...notificationPermissionsPayload,
      applications: true,
    })

    expect(await userService.updateNotificationPermissionsForUserId(userId, { applications: true })).toEqual({
      userId,
      ...notificationPermissionsPayload,
      applications: true,
    })
    expect(notificationPermissionsRepository.update).toHaveBeenCalledWith(userId, { applications: true })
    expect(notificationPermissionsRepository.create).toHaveBeenCalledWith({ userId, applications: true })
  })
})
