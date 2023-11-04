import { type ColumnType } from "kysely"

export type EventStatus = "ATTENDANCE" | "NO_LIMIT" | "PUBLIC" | "TBA"

export type EventType = "ACADEMIC" | "BEDPRES" | "COMPANY" | "SOCIAL"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>

export type PaymentProvider = "STRIPE"

export type PaymentStatus = "PAID" | "REFUNDED" | "UNPAID"

export type ProductType = "EVENT"

export type RefundRequestStatus = "APPROVED" | "PENDING" | "REJECTED"

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Attendance {
  createdAt: Generated<Timestamp>
  deregisterDeadline: Timestamp
  end: Timestamp
  eventId: string | null
  id: Generated<string>
  limit: number
  max: Generated<number>
  min: Generated<number>
  start: Timestamp
  updatedAt: Generated<Timestamp>
}

export interface Attendee {
  attendanceId: string | null
  attended: Generated<boolean>
  createdAt: Generated<Timestamp>
  id: Generated<string>
  updatedAt: Generated<Timestamp>
  userId: string | null
}

export interface Committee {
  createdAt: Generated<Timestamp>
  description: Generated<string>
  email: Generated<string>
  id: Generated<string>
  image: string | null
  name: string
}

export interface Company {
  createdAt: Generated<Timestamp>
  description: string
  email: string
  id: Generated<string>
  image: string | null
  location: string | null
  name: string
  phone: string | null
  type: string | null
  website: string
}

export interface DrizzleDrizzleMigrations {
  id: Generated<number>
  hash: string
  createdAt: Int8 | null
}

export interface Event {
  createdAt: Generated<Timestamp>
  description: string | null
  end: Timestamp
  id: Generated<string>
  imageUrl: string | null
  location: string | null
  public: boolean
  start: Timestamp
  status: EventStatus
  subtitle: string | null
  title: string
  type: EventType | null
  updatedAt: Generated<Timestamp>
  waitlist: string | null
}

export interface EventCommittee {
  committeeId: string
  eventId: string
}

export interface EventCompany {
  companyId: string
  eventId: string
}

export interface JobListing {
  applicationEmail: string | null
  applicationLink: string | null
  companyId: string | null
  createdAt: Generated<Timestamp>
  deadline: Timestamp | null
  deadlineAsap: boolean
  description: string
  employment: string
  end: Timestamp
  featured: boolean
  id: Generated<string>
  ingress: string
  start: Timestamp
  title: string
}

export interface JobListingLocation {
  createdAt: Generated<Timestamp>
  id: Generated<string>
  name: string
}

export interface JobListingLocationLink {
  createdAt: Generated<Timestamp>
  id: Generated<string>
  jobListingId: string | null
  locationId: string | null
}

export interface Mark {
  category: string
  createdAt: Timestamp
  details: string | null
  duration: number
  id: Generated<string>
  title: string
  updatedAt: Generated<Timestamp>
}

export interface NotificationPermissions {
  applications: Generated<boolean>
  createdAt: Generated<Timestamp>
  groupMessages: Generated<boolean>
  markRulesUpdates: Generated<boolean>
  newArticles: Generated<boolean>
  receipts: Generated<boolean>
  registrationByAdministrator: Generated<boolean>
  registrationStart: Generated<boolean>
  standardNotifications: Generated<boolean>
  updatedAt: Generated<Timestamp>
  userId: string
}

export interface OwUser {
  cognitoSub: string
  createdAt: Generated<Timestamp>
  id: Generated<string>
  studyYear: Generated<number>
}

export interface Payment {
  createdAt: Generated<Timestamp>
  id: Generated<string>
  paymentProviderId: string
  paymentProviderOrderId: string | null
  paymentProviderSessionId: string
  productId: string | null
  status: PaymentStatus
  updatedAt: Generated<Timestamp>
  userId: string | null
}

export interface PersonalMark {
  markId: string
  userId: string
}

export interface PrivacyPermissions {
  addressVisible: Generated<boolean>
  attendanceVisible: Generated<boolean>
  createdAt: Generated<Timestamp>
  emailVisible: Generated<boolean>
  phoneVisible: Generated<boolean>
  profileVisible: Generated<boolean>
  updatedAt: Generated<Timestamp>
  userId: string
  usernameVisible: Generated<boolean>
}

export interface Product {
  amount: number
  createdAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  id: Generated<string>
  isRefundable: Generated<boolean>
  objectId: string | null
  refundRequiresApproval: Generated<boolean>
  type: ProductType
  updatedAt: Generated<Timestamp>
}

export interface ProductPaymentProvider {
  paymentProvider: PaymentProvider
  paymentProviderId: string
  productId: string
}

export interface RefundRequest {
  createdAt: Generated<Timestamp>
  handledBy: string | null
  id: Generated<string>
  paymentId: string | null
  reason: string
  status: Generated<RefundRequestStatus>
  updatedAt: Generated<Timestamp>
  userId: string | null
}

export interface DB {
  "attendance": Attendance
  "attendee": Attendee
  "committee": Committee
  "company": Company
  "drizzle.DrizzleMigrations": DrizzleDrizzleMigrations
  "event": Event
  "eventCommittee": EventCommittee
  "eventCompany": EventCompany
  "jobListing": JobListing
  "jobListingLocation": JobListingLocation
  "jobListingLocationLink": JobListingLocationLink
  "mark": Mark
  "notificationPermissions": NotificationPermissions
  "owUser": OwUser
  "payment": Payment
  "personalMark": PersonalMark
  "privacyPermissions": PrivacyPermissions
  "product": Product
  "productPaymentProvider": ProductPaymentProvider
  "refundRequest": RefundRequest
}
