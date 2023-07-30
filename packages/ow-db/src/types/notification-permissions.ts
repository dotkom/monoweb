import { Generated } from "kysely"

export interface NotificationPermissionsTable {
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  userId: string
  applications: boolean
  newArticles: boolean
  standardNotifications: boolean
  groupMessages: boolean
  prikkereglerUpdates: boolean
  receipts: boolean
  registrationByAdministrator: boolean
  registrationStart: boolean
}
