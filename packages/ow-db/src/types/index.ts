import { CompanyTable, EventCompanyTable } from "./company"
import { EventTable, AttendanceTable, AttendeeTable, CommitteeTable } from "./event"
import { UserTable, SessionTable, VerificationTokenTable, AccountTable } from "./user"

export interface Database {
  ow_user: UserTable
  company: CompanyTable
  session: SessionTable
  verification_token: VerificationTokenTable
  account: AccountTable
  event: EventTable
  attendance: AttendanceTable
  committee: CommitteeTable
  attendee: AttendeeTable
  event_company: EventCompanyTable
}
