import type { Database } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import type { Kysely } from "kysely"
import { type AttendanceRepository, AttendanceRepositoryImpl } from "../../attendance/attendance-repository"
import { type Auth0Repository, Auth0RepositoryImpl } from "../../external/auth0-repository"
import {
  type Auth0SynchronizationService,
  Auth0SynchronizationServiceImpl,
} from "../../external/auth0-synchronization-service"
import {
  type NotificationPermissionsRepository,
  NotificationPermissionsRepositoryImpl,
} from "../notification-permissions-repository"
import { type PrivacyPermissionsRepository, PrivacyPermissionsRepositoryImpl } from "../privacy-permissions-repository"
import { type UserRepository, UserRepositoryImpl } from "../user-repository"
import { type UserService, UserServiceImpl } from "../user-service"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayerForUserTests>>

export interface ServerLayerOptions {
  db: Kysely<Database>
  auth0MgmtClient: ManagementClient
}

export const createServiceLayerForUserTests = async ({ db, auth0MgmtClient }: ServerLayerOptions) => {
  const auth0Repository: Auth0Repository = new Auth0RepositoryImpl(auth0MgmtClient)

  const userRepository: UserRepository = new UserRepositoryImpl(db)

  const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl(db)
  const privacyPermissionsRepository: PrivacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository: NotificationPermissionsRepository =
    new NotificationPermissionsRepositoryImpl(db)

  const auth0SynchronizationService: Auth0SynchronizationService = new Auth0SynchronizationServiceImpl(
    userRepository,
    auth0Repository
  )

  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    auth0Repository,
    auth0SynchronizationService
  )

  return {
    attendanceRepository,
    auth0Repository,
    auth0SynchronizationService,
    userService,
    userRepository,
  }
}
