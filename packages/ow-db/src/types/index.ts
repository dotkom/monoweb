import { CompanyTable, EventCompanyTable } from "./company"
import { EventTable, AttendanceTable, AttendeeTable } from "./event"
import { MarkTable, PersonalMarkTable } from "./marks"
import { UserTable, SessionTable, VerificationTokenTable, AccountTable } from "./user"
import { CommitteeTable, EventCommitteeTable } from "./committee"

export interface Database {
  owUser: UserTable
  company: CompanyTable
  session: SessionTable
  verificationToken: VerificationTokenTable
  account: AccountTable
  event: EventTable
  attendance: AttendanceTable
  committee: CommitteeTable
  attendee: AttendeeTable
  eventCompany: EventCompanyTable
  eventCommittee: EventCommitteeTable
  mark: MarkTable
  personalMark: PersonalMarkTable
}
