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
import type { NotificationPermissionsRepository } from "./notification-permissions-repository"
import type { PrivacyPermissionsRepository } from "./privacy-permissions-repository"
import type { UserRepository } from "./user-repository"

// Until we have gather this data from the user, this fake data is used as the initial data for new users
const FAKE_USER_EXTRA_SIGNUP_DATA: Omit<UserWrite, "email" | "id" | "auth0Id"> = {
  givenName: "firstName",
  familyName: "lastName",
  middleName: "middleName",
  name: "firstName middleName lastName",
  allergies: ["allergy1", "allergy2"],
  picture: "https://example.com/image.jpg",
  studyYear: -1,
  lastSyncedAt: new Date(),
  phone: "12345678",
  gender: "male",
}

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
  update(data: User): Promise<User>
  getByAuth0Id(auth0Id: string): Promise<User | null>
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
    private readonly notificationPermissionsRepository: NotificationPermissionsRepository,
    private readonly auth0Repository: Auth0Service,
    private readonly auth0SynchronizationService: Auth0SynchronizationService
  ) {}

  async getByAuth0Id(auth0Id: string) {
    return this.userRepository.getByAuth0Id(auth0Id)
  }

  async create(data: UserWrite) {
    return this.userRepository.create(data)
  }

  async update(data: User) {
    return this.userRepository.update(data.id, data)
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
}
