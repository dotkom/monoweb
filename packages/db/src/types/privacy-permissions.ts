import { Generated } from "kysely"

export interface PrivacyPermissionsTable {
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  userId: string
  profileVisible: boolean
  usernameVisible: boolean
  emailVisible: boolean
  phoneVisible: boolean
  addressVisible: boolean
  attendanceVisible: boolean
}
