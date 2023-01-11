import { CompanyTable, EventCompanyTable } from "./company"
import { EventTable, AttendanceTable, AttendeeTable, CommitteeTable } from "./event"
import { MarkTable, PersonalMarkTable } from "./marks"
import { UserTable, SessionTable, VerificationTokenTable, AccountTable } from "./user"

export interface Database {
  owUser: UserTable
  Company: CompanyTable
  Session: SessionTable
  VerificationToken: VerificationTokenTable
  Account: AccountTable
  Event: EventTable
  Attendance: AttendanceTable
  Committee: CommitteeTable
  Attendee: AttendeeTable
  EventCompany: EventCompanyTable
  Mark: MarkTable
  PersonalMark: PersonalMarkTable
}
