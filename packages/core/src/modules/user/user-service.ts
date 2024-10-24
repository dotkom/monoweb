import {
  FeideDocumentationSchema,
  UserWriteSchema,
  type FeideDocumentation,
  type NotificationPermissions,
  type NotificationPermissionsWrite,
  type PrivacyPermissions,
  type PrivacyPermissionsWrite,
  type User,
  type UserId,
  type UserEditableFields,
  type UserWrite,
} from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"
import { env } from "@dotkomonline/env"
import jwt from "jsonwebtoken"
import { Auth0Repository } from "../external/auth0-repository"

export interface UserService {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number): Promise<User[]>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
  create(data: UserWrite): Promise<User>
  updateByAuth0Id(userId: string, data: Partial<UserWrite>): Promise<User>
  getByAuth0Id(auth0Id: string): Promise<User | null>
  signup(auth0Id: string, signupInfo: UserEditableFields, feideDocumentationJWT: string): Promise<User>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository,
    private readonly auth0Repository: Auth0Repository,
  ) {}

  async getByAuth0Id(auth0Id: string) {
    return this.userRepository.getByAuth0Id(auth0Id)
  }

  async create(data: UserWrite) {
    return this.userRepository.create(data)
  }

  async updateByAuth0Id(auth0Id: string, data: Partial<UserWrite>) {
    return this.userRepository.updateByAuth0Id(auth0Id, data)
  }

  async getAll(limit: number) {
    return await this.userRepository.getAll(limit)
  }

  async getById(id: User["id"]) {
    return this.userRepository.getById(id)
  }

  async searchByFullName(searchQuery: string, take: number) {
    return this.userRepository.searchByFullName(searchQuery, take)
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

  async signup(auth0Id: string, signupInfo: UserEditableFields, feideDocumentationJWT: string): Promise<User> {
    const feideDocumentation = FeideDocumentationSchema.parse(jwt.verify(feideDocumentationJWT, env.FEIDE_JWT_SECRET))

    const auth0User = await this.auth0Repository.get(auth0Id)
    if (!auth0User) {
      throw new Error("User not found in Auth0")
    }

    const userWrite: UserWrite = UserWriteSchema.parse({
      auth0Id,
      email: auth0User.email,
      givenName: feideDocumentation.givenName,
      familyName: feideDocumentation.familyName,
      gender: signupInfo.gender,
      name: feideDocumentation.fullName,
      biography: signupInfo.biography,
      phone: signupInfo.phone,
      allergies: signupInfo.allergies,
      picture: null,
      studyYear: null
    })

    return this.create(userWrite)
  }
}
