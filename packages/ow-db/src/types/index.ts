import { Generated } from "kysely"

import { EventTable, AttendanceTable, AttendeeTable, CommitteeTable, CompanyTable } from "./event"
import { UserTable, SessionTable, VerificationTokenTable, AccountTable } from "./user"

export interface Database {
  user: UserTable
  company: CompanyTable
  session: SessionTable
  verificationToken: VerificationTokenTable
  account: AccountTable
  event: EventTable
  attendance: AttendanceTable
  committee: CommitteeTable
  attendee: AttendeeTable
}
