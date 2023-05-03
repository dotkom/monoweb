import { AccountTable, SessionTable, UserTable, VerificationTokenTable } from "./user"
import { AttendanceTable, AttendeeTable, EventTable } from "./event"
import { CommitteeTable, EventCommitteeTable } from "./committee"
import { CompanyTable, EventCompanyTable } from "./company"
import { MarkTable, PersonalMarkTable } from "./marks"
import { PaymentTable, ProductPaymentProviderTable, ProductTable } from "./payment"

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
  product: ProductTable
  payment: PaymentTable
  productPaymentProvider: ProductPaymentProviderTable
}
