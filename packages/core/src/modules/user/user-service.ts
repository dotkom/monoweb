import type {
  Membership,
  NotificationPermissions,
  NotificationPermissionsWrite,
  PrivacyPermissions,
  PrivacyPermissionsWrite,
  User,
  UserId,
  UserWrite,
} from "@dotkomonline/types"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"

export interface UserService {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, offset: number): Promise<User[]>
  searchForUser(query: string, limit: number, offset: number): Promise<User[]>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  update(userId: UserId, data: Partial<UserWrite>): Promise<User>
  registerAndGet(auth0Id: string): Promise<User>
}

export class UserServiceImpl implements UserService {
  private readonly userRepository: UserRepository
  private readonly privacyPermissionsRepository: PrivacyPermissionsRepository
  private readonly notificationPermissionsRepository: NotificationPermissionsRepository

  constructor(
    userRepository: UserRepository,
    privacyPermissionsRepository: PrivacyPermissionsRepository,
    notificationPermissionsRepository: NotificationPermissionsRepository
  ) {
    this.userRepository = userRepository
    this.privacyPermissionsRepository = privacyPermissionsRepository
    this.notificationPermissionsRepository = notificationPermissionsRepository
  }

  async registerAndGet(auth0Id: string) {
    return this.userRepository.registerAndGet(auth0Id)
  }

  async getById(auth0Id: string) {
    return this.userRepository.getById(auth0Id)
  }

  async update(userId: UserId, data: Partial<UserWrite>): Promise<User> {
    return this.userRepository.update(userId, data)
  }

  async getAll(limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.getAll(limit, offset)
  }

  // https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
  async searchForUser(query: string, limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.searchForUser(query, limit, offset)
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
