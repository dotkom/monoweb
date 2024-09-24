import type {
  NotificationPermissions,
  NotificationPermissionsWrite,
  PrivacyPermissions,
  PrivacyPermissionsWrite,
  User,
  UserId,
  UserMetadata,
  UserMetadataWrite,
} from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
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
  updateMetadata(userId: UserId, data: UserMetadataWrite): Promise<UserMetadata>
  registerId(id: UserId): Promise<void>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository
  ) {}

  async registerId(id: UserId) {
    return this.userRepository.registerId(id)
  }

  async getById(auth0Id: string) {
    return this.userRepository.getById(auth0Id)
  }

  async updateMetadata(userId: UserId, data: UserMetadataWrite) {
    return this.userRepository.updateMetadata(userId, data)
  }

  async getAll(limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.getAll(limit, offset)
  }

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
