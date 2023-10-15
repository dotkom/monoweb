import type { ColumnType } from "kysely";

export type EventStatus = "ATTENDANCE" | "NO_LIMIT" | "PUBLIC" | "TBA";

export type EventType = "ACADEMIC" | "BEDPRES" | "COMPANY" | "SOCIAL";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type PaymentProvider = "STRIPE";

export type PaymentStatus = "PAID" | "REFUNDED" | "UNPAID";

export type ProductType = "EVENT";

export type RefundRequestStatus = "APPROVED" | "PENDING" | "REJECTED";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Attendance {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  start: Timestamp;
  end: Timestamp;
  deregisterDeadline: Timestamp;
  limit: number;
  eventId: string | null;
  min: Generated<number>;
  max: Generated<number>;
}

export interface Attendee {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
  attendanceId: string | null;
  attended: Generated<boolean>;
}

export interface Committee {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  name: string;
  description: Generated<string>;
  email: Generated<string>;
  image: string | null;
}

export interface Company {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  name: string;
  description: string;
  phone: string | null;
  email: string;
  website: string;
  location: string | null;
  type: string | null;
  image: string | null;
}

export interface DrizzleDrizzleMigrations {
  id: Generated<number>;
  hash: string;
  createdAt: Int8 | null;
}

export interface Event {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  title: string;
  start: Timestamp;
  end: Timestamp;
  status: EventStatus;
  public: boolean;
  description: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  location: string | null;
  type: EventType | null;
  waitlist: string | null;
}

export interface EventCommittee {
  committeeId: string;
  eventId: string;
}

export interface EventCompany {
  eventId: string;
  companyId: string;
}

export interface Mark {
  id: Generated<string>;
  updatedAt: Generated<Timestamp>;
  title: string;
  createdAt: Timestamp;
  category: string;
  details: string | null;
  duration: number;
}

export interface NotificationPermissions {
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  userId: string;
  applications: Generated<boolean>;
  newArticles: Generated<boolean>;
  standardNotifications: Generated<boolean>;
  groupMessages: Generated<boolean>;
  markRulesUpdates: Generated<boolean>;
  receipts: Generated<boolean>;
  registrationByAdministrator: Generated<boolean>;
  registrationStart: Generated<boolean>;
}

export interface OwUser {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  cognitoSub: string;
}

export interface Payment {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  productId: string | null;
  userId: string | null;
  paymentProviderId: string;
  paymentProviderSessionId: string;
  status: PaymentStatus;
  paymentProviderOrderId: string | null;
}

export interface PersonalMark {
  markId: string;
  userId: string;
}

export interface PrivacyPermissions {
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  userId: string;
  profileVisible: Generated<boolean>;
  usernameVisible: Generated<boolean>;
  emailVisible: Generated<boolean>;
  phoneVisible: Generated<boolean>;
  addressVisible: Generated<boolean>;
  attendanceVisible: Generated<boolean>;
}

export interface Product {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  type: ProductType;
  objectId: string | null;
  amount: number;
  deletedAt: Timestamp | null;
  isRefundable: Generated<boolean>;
  refundRequiresApproval: Generated<boolean>;
}

export interface ProductPaymentProvider {
  productId: string;
  paymentProvider: PaymentProvider;
  paymentProviderId: string;
}

export interface RefundRequest {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  paymentId: string | null;
  userId: string | null;
  reason: string;
  status: Generated<RefundRequestStatus>;
  handledBy: string | null;
}

export interface DB {
  attendance: Attendance;
  attendee: Attendee;
  committee: Committee;
  company: Company;
  "drizzle.DrizzleMigrations": DrizzleDrizzleMigrations;
  event: Event;
  eventCommittee: EventCommittee;
  eventCompany: EventCompany;
  mark: Mark;
  notificationPermissions: NotificationPermissions;
  owUser: OwUser;
  payment: Payment;
  personalMark: PersonalMark;
  privacyPermissions: PrivacyPermissions;
  product: Product;
  productPaymentProvider: ProductPaymentProvider;
  refundRequest: RefundRequest;
}
