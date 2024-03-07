import {
  type OidcUser,
  type NotificationPermissions,
  type NotificationPermissionsWrite,
  type PrivacyPermissions,
  type PrivacyPermissionsWrite,
  type User,
  type UserId,
  type UserWrite,
} from "@dotkomonline/types"
import { type NotificationPermissionsRepository } from "./notification-permissions-repository"
import { type PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import { type UserRepository } from "./user-repository"
import { type Auth0Repository } from "../../lib/auth0-repository"
import { type Cursor } from "../../utils/db-utils"

export interface UserService {
  getUserById(id: UserId): Promise<User | undefined>
  getUsersById(ids: UserId[]): Promise<User[] | undefined>
  getUserBySubject(id: User["auth0Sub"]): Promise<User | undefined>
  getDBUserBySubject(id: User["auth0Sub"]): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  createUser(input: UserWrite): Promise<User>
  updateUser(id: UserId, payload: Partial<UserWrite>): Promise<User>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
  getUserBySubjectIDP(id: User["auth0Sub"][]): Promise<OidcUser[]>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository,
    private readonly idpRepository: Auth0Repository
  ) {}
  private mergeUsers(User: User | undefined, usersIDP: OidcUser | undefined): User | undefined {
    if (!User || !usersIDP) {
      return undefined
    }
    return {
      ...User,
      ...usersIDP,
    }
  }

  private mergeUsersArray(usersDB: (User | undefined)[], usersIDP: (OidcUser | undefined)[]): User[] {
    return usersDB
      .map((user) => {
        if (user === undefined) {
          return undefined
        }
        const userFromIDP = usersIDP.find((u) => u?.subject === user.auth0Sub)
        if (!userFromIDP) {
          throw new Error(`User with auth0Sub ${user.auth0Sub} not found in IDP`)
        }
        return {
          ...user,
          ...userFromIDP,
        }
      })
      .filter((u) => u !== undefined) as User[]
  }

  async getAllUsers(limit: number) {
    return await this.userRepository.getAll(limit)
  }

  async getUsersById(ids: UserId[]) {
    const usersDB = await Promise.all(ids.map(async (id) => this.userRepository.getById(id)))
    if (usersDB.includes(undefined)) {
      throw new Error("User from DB is undefined")
    }
    const usersIDP = await Promise.all(usersDB.map(async (u) => this.idpRepository.getBySubject(u?.auth0Sub || ""))) // TODO: this is a hack
    return this.mergeUsersArray(usersDB, usersIDP)
  }

  async getDBUserBySubject(id: User["auth0Sub"]) {
    return this.userRepository.getBySubject(id)
  }

  async searchByFullName(searchQuery: string, take: number) {
    return this.userRepository.searchByFullName(searchQuery, take)
  }

  async getUserById(id: UserId) {
    const User = await this.userRepository.getById(id)
    if (!User) {
      return undefined
    }
    const userIDP = await this.idpRepository.getBySubject(User.auth0Sub)

    if (!userIDP) {
      return undefined
    }

    return this.mergeUsers(User, userIDP)
  }

  async getUserBySubject(subject: User["auth0Sub"]) {
    const User = await this.userRepository.getBySubject(subject)
    const userIDP = await this.idpRepository.getBySubject(subject)

    if (!User || !userIDP) {
      console.log("User not found in DB or IDP", User, userIDP)
      return undefined
    }

    return this.mergeUsers(User, userIDP)
  }

  async getUserBySubjectIDP(id: User["auth0Sub"][]) {
    const result = []
    for (const sub of id) {
      const user = await this.idpRepository.getBySubject(sub)
      if (!user) {
        continue
      }
      result.push(user)
    }

    return result
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
