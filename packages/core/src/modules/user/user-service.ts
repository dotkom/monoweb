import {
  type UserDB,
  type UserIDP,
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
import { type IDPRepository } from "../../lib/IDP-repository"
import { type Cursor } from "../../utils/db-utils"

export interface UserService {
  getUserById(id: UserId): Promise<User | undefined>
  getUsersById(ids: UserId[]): Promise<User[] | undefined>
  getUserBySubject(id: User["auth0Sub"]): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  createUser(input: UserWrite): Promise<UserDB>
  updateUser(id: UserId, payload: Partial<UserWrite>): Promise<UserDB>
  getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>
  updatePrivacyPermissionsForUserId(
    id: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions>
  searchUsersFromIDP(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
  getUserBySubjectIDP(id: User["auth0Sub"][]): Promise<UserIDP[] | undefined>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository,
    private readonly idpRepository: IDPRepository
  ) {}
  private mergeUsers(userDB: UserDB | undefined, usersIDP: UserIDP | undefined): User | undefined {
    if (!userDB || !usersIDP) {
      return undefined
    }
    return {
      ...userDB,
      ...usersIDP,
    }
  }

  private mergeUsersArray(usersDB: (UserDB | undefined)[], usersIDP: (UserIDP | undefined)[]): User[] {
    return usersDB.map((user) => {
      if (user === undefined) {
        throw new Error("User from DB is undefined")
      }
      const userFromIDP = usersIDP.find((u) => u?.subject === user.cognitoSub)
      if (!userFromIDP) {
        throw new Error(`User with cognitoSub ${user.cognitoSub} not found in IDP`)
      }
      return {
        ...user,
        ...userFromIDP,
      }
    })
  }

  async getAllUsers(limit: number) {
    const usersDB = await this.userRepository.getAll(limit)
    const usersIDP = await this.idpRepository.getAll(limit)
    return this.mergeUsersArray(usersDB, usersIDP)
  }

  async getUsersById(ids: UserId[]) {
    const usersDB = await Promise.all(ids.map(async (id) => this.userRepository.getById(id)))
    if (usersDB.includes(undefined)) {
      throw new Error("User from DB is undefined")
    }
    const usersIDP = await Promise.all(usersDB.map(async (u) => this.idpRepository.getBySubject(u?.cognitoSub || ""))) // TODO: this is a hack
    return this.mergeUsersArray(usersDB, usersIDP)
  }

  async searchUsersFromIDP(searchQuery: string, take: number) {
    const usersIDP = await this.idpRepository.search(searchQuery, take)
    const usersDB = await Promise.all(usersIDP.map(async (user) => this.userRepository.getBySubject(user.subject)))
    return this.mergeUsersArray(usersDB, usersIDP)
  }

  async getUserById(id: UserId) {
    const userDB = await this.userRepository.getById(id)
    if (!userDB) {
      return undefined
    }
    const userIDP = await this.idpRepository.getBySubject(userDB.cognitoSub)

    if (!userIDP) {
      return undefined
    }

    return this.mergeUsers(userDB, userIDP)
  }

  async getUserBySubject(id: User["auth0sub"]) {
    const userDB = await this.userRepository.getBySubject(id)
    const userIDP = await this.idpRepository.getBySubject(id)
    return this.mergeUsers(userDB, userIDP)
  }

  async getUserBySubjectIDP(id: User["auth0sub"][]) {
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
