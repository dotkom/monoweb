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
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"

export interface UserService {
  getUserById(id: UserId): Promise<User | undefined>
  getUserBySubject(id: User["cognitoSub"]): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  searchUsers(searchQuery: string, take: number): Promise<User[]>
  createUser(input: UserWrite): Promise<User>
  updateUser(id: UserId, payload: UserWrite): Promise<User>
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
    if (!user) {
      throw new NotFoundError(`User with ID:${id} not found`)
    }
    return user
  }

  async searchUsers(searchQuery: string, take: number, cursor?: Cursor) {
    const users = await this.userRepository.search(searchQuery, take, cursor)
    return users
  }

  async getUserBySubject(id: User["cognitoSub"]) {
    const user = await this.userRepository.getBySubject(id)
    if (!user) {
      throw new NotFoundError(`User with subject:${id} not found`)
    }
    return user
  }

  async createUser(input: UserWrite) {
    const res = await this.userRepository.create(input)
    return res
  }

  async updateUser(id: UserId, data: UserWrite) {
    const res = await this.userRepository.update(id, data)
    if (!res) {
      throw new NotFoundError(`User with ID:${id} not found`)
    }
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
