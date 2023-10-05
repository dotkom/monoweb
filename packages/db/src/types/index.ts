import { type AccountTable, type SessionTable, type UserTable, type VerificationTokenTable } from "./user";
import { type AttendanceTable, type AttendeeTable, type EventTable } from "./event";
import { type CommitteeTable, type EventCommitteeTable } from "./committee";
import { type CompanyTable, type EventCompanyTable } from "./company";
import { type MarkTable, type PersonalMarkTable } from "./marks";
import {
    type PaymentTable,
    type ProductPaymentProviderTable,
    type ProductTable,
    type RefundRequestTable,
} from "./payment";

import { type PrivacyPermissionsTable } from "./privacy-permissions";
import { type NotificationPermissionsTable } from "./notification-permissions";

export interface Database {
    owUser: UserTable;
    company: CompanyTable;
    session: SessionTable;
    verificationToken: VerificationTokenTable;
    account: AccountTable;
    event: EventTable;
    attendance: AttendanceTable;
    committee: CommitteeTable;
    attendee: AttendeeTable;
    eventCompany: EventCompanyTable;
    eventCommittee: EventCommitteeTable;
    mark: MarkTable;
    personalMark: PersonalMarkTable;
    product: ProductTable;
    payment: PaymentTable;
    productPaymentProvider: ProductPaymentProviderTable;
    refundRequest: RefundRequestTable;
    privacyPermissions: PrivacyPermissionsTable;
    notificationPermissions: NotificationPermissionsTable;
}
