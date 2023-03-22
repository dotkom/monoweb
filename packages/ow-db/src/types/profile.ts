import { Generated } from "kysely"

export interface ProfileTable {
  userId: string
  updatedAt: Generated<Date>
  showName: boolean
  visibleForOtherUsers: boolean
  showEmail: boolean
  showAdress: boolean
  visibleInEvents: boolean
  allowPictures: boolean
}
