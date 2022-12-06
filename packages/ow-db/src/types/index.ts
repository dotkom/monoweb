import { CompanyTable, EventCompanyTable } from "./company"
import { EventTable, AttendanceTable, AttendeeTable, CommitteeTable } from "./event"
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
  eventCompany: EventCompanyTable
}
