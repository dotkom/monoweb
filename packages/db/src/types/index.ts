import { type CommitteeTable, type EventCommitteeTable } from "./committee";
import { type CompanyTable, type EventCompanyTable } from "./company";
import { type AttendanceTable, type AttendeeTable, type EventTable } from "./event";
import { type MarkTable, type PersonalMarkTable } from "./marks";
import { type NotificationPermissionsTable } from "./notification-permissions";
import {
  type PaymentTable,
  type ProductPaymentProviderTable,
  type ProductTable,
  type RefundRequestTable,
} from "./payment";
import { type PrivacyPermissionsTable } from "./privacy-permissions";
import { type AccountTable, type SessionTable, type UserTable, type VerificationTokenTable } from "./user";

export interface Database {
  account: AccountTable;
  attendance: AttendanceTable;
  attendee: AttendeeTable;
  committee: CommitteeTable;
  company: CompanyTable;
  event: EventTable;
  eventCommittee: EventCommitteeTable;
  eventCompany: EventCompanyTable;
  mark: MarkTable;
  notificationPermissions: NotificationPermissionsTable;
  owUser: UserTable;
  payment: PaymentTable;
  personalMark: PersonalMarkTable;
  privacyPermissions: PrivacyPermissionsTable;
  product: ProductTable;
  productPaymentProvider: ProductPaymentProviderTable;
  refundRequest: RefundRequestTable;
  session: SessionTable;
  verificationToken: VerificationTokenTable;
}
