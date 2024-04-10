import type {
  NotificationPermissions,
  NotificationPermissionsWrite,
  PrivacyPermissions,
  PrivacyPermissionsWrite,
  User,
  UserId,
  UserWrite,
} from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import type { Auth0Service } from "../external/auth0-service"
import type { Auth0SynchronizationService } from "../external/auth0-synchronization-service"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { UserNotFoundError } from "./user-error"
import type { UserRepository } from "./user-repository"

type OnboardUserWrite = {
  firstName: string
  lastName: string
  allergies: string[]

  studyYear?: number
  phone?: string
  picture?: string
}

export interface UserService {
  onboardUser(id: UserId, data: OnboardUserWrite): Promise<User>
  getById(id: UserId): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  searchUsers(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
  createUser(input: UserWrite): Promise<User>
  updateUser(id: UserId, payload: Partial<UserWrite>): Promise<User>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  getNotificationPermissionsByUserId(id: string): Promise<NotificationPermissions>
  updateNotificationPermissionsForUserId(
    id: string,
    data: Partial<Omit<NotificationPermissionsWrite, "userId">>
  ): Promise<NotificationPermissions>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository,
    private readonly auth0Repository: Auth0Service,
    private readonly auth0SynchronizationService: Auth0SynchronizationService
  ) {}
  async getAllUsers(limit: number) {
    const users = await this.userRepository.getAll(limit)
    return users
  }

  async onboardUser(id: UserId, data: OnboardUserWrite) {
    const user = await this.userRepository.getById(id)
    if (!user) {
      throw new UserNotFoundError(id)
    }

    const onboardedUser: UserWrite = {
      ...user,
      givenName: data.firstName,
      familyName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      allergies: data.allergies,
      studyYear: data.studyYear ?? -1,
      phoneNumber: data.phone ?? null,
      profilePicture: data.picture ?? null,
      lastSyncedAt: null,
    }

    await this.auth0Repository.updateUser(id, onboardedUser)
    await this.auth0SynchronizationService.handleUserSync(id)

    return this.getById(id)
  }

  async getById(id: UserId) {
    const user = await this.userRepository.getById(id)
    return user
  }

  async searchUsers(searchQuery: string, take: number, cursor?: Cursor) {
    const users = await this.userRepository.search(searchQuery, take, cursor)
    return users
  }

  async createUser(input: UserWrite) {
    const res = await this.userRepository.create(input)
    return res
  }

  async updateUser(id: UserId, data: UserWrite) {
    const result = await this.auth0Repository.updateUser(id, data)
    await this.auth0SynchronizationService.synchronizeUser(result)
    return result
  }

  async getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions> {
    let privacyPermissions = await this.privacyPermissionsRepository.getByUserId(id)

    if (!privacyPermissions) {
      privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id })
    }

    return privacyPermissions
  }

  async updatePrivacyPermissionsForUserId(
    id: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions> {
    let privacyPermissions = await this.privacyPermissionsRepository.update(id, data)

    if (!privacyPermissions) {
      privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id, ...data })
    }

    return privacyPermissions
  }

  async getNotificationPermissionsByUserId(id: string): Promise<NotificationPermissions> {
    let notificationPermissions = await this.notificationPermissionsRepository.getByUserId(id)

    if (!notificationPermissions) {
      notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id })
    }

    return notificationPermissions
  }

  async updateNotificationPermissionsForUserId(
    id: string,
    data: Partial<Omit<NotificationPermissionsWrite, "userId">>
  ): Promise<NotificationPermissions> {
    let notificationPermissions = await this.notificationPermissionsRepository.update(id, data)

    if (!notificationPermissions) {
      notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id, ...data })
    }

    return notificationPermissions
  }
}
