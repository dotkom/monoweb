import {
  type UserId,
  type NotificationPermissions,
  type NotificationPermissionsWrite,
  type PrivacyPermissions,
  type PrivacyPermissionsWrite,
  type User,
  type UserWrite,
} from "@dotkomonline/types"
import { type NotificationPermissionsRepository } from "./notification-permissions-repository"
import { type PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { type UserRepository } from "./user-repository"
import { type Cursor } from "../../utils/db-utils"

export interface UserService {
  getUserById(id: UserId): Promise<User | undefined>
  getUserBySubject(id: User["cognitoSub"]): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  searchUsers(searchQuery: string, take: number): Promise<User[]>
  createUser(input: UserWrite): Promise<User>
  updateUser(id: UserId, payload: Partial<UserWrite>): Promise<User>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository
  ) {}
  async getAllUsers(limit: number) {
    const users = await this.userRepository.getAll(limit)
    return users
  }

  async getUserById(id: UserId) {
    const user = await this.userRepository.getById(id)
    return user
  }

  async searchUsers(searchQuery: string, take: number, cursor?: Cursor) {
    const users = await this.userRepository.search(searchQuery, take, cursor)
    return users
  }

  async getUserBySubject(id: User["cognitoSub"]) {
    const user = await this.userRepository.getBySubject(id)
    return user
  }

  async createUser(input: UserWrite) {
    const res = await this.userRepository.create(input)
    return res
  }

  async updateUser(id: UserId, data: Partial<UserWrite>) {
    const res = await this.userRepository.update(id, data)
    return res
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
