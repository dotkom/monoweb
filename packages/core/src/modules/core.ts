import { S3Client } from "@aws-sdk/client-s3"
import type { Database } from "@dotkomonline/db"
import { env } from "@dotkomonline/env"
import { ManagementClient } from "auth0"
import type { Kysely } from "kysely"
import Stripe from "stripe"
import { type ArticleRepository, ArticleRepositoryImpl } from "./article/article-repository"
import { type ArticleService, ArticleServiceImpl } from "./article/article-service"
import { type ArticleTagLinkRepository, ArticleTagLinkRepositoryImpl } from "./article/article-tag-link-repository"
import { type ArticleTagRepository, ArticleTagRepositoryImpl } from "./article/article-tag-repository"
import { type AttendancePoolRepository, AttendancePoolRepositoryImpl } from "./attendance/attendance-pool-repository"
import { type AttendancePoolService, AttendancePoolServiceImpl } from "./attendance/attendance-pool-service"
import { type AttendanceRepository, AttendanceRepositoryImpl } from "./attendance/attendance-repository"
import { type AttendanceService, AttendanceServiceImpl } from "./attendance/attendance-service"
import { type AttendeeRepository, AttendeeRepositoryImpl } from "./attendance/attendee-repository"
import { type AttendeeService, AttendeeServiceImpl } from "./attendance/attendee-service"
import {
  type WaitlistAttendeRepository,
  WaitlistAttendeRepositoryImpl,
} from "./attendance/waitlist-attendee-repository"
import { type WaitlistAttendeService, WaitlistAttendeServiceImpl } from "./attendance/waitlist-attendee-service"
import { type CommitteeRepository, CommitteeRepositoryImpl } from "./committee/committee-repository"
import { type CommitteeService, CommitteeServiceImpl } from "./committee/committee-service"
import { type CompanyEventRepository, CompanyEventRepositoryImpl } from "./company/company-event-repository"
import { type CompanyEventService, CompanyEventServiceImpl } from "./company/company-event-service"
import { type CompanyRepository, CompanyRepositoryImpl } from "./company/company-repository"
import { type CompanyService, CompanyServiceImpl } from "./company/company-service"
import { type EventCommitteeRepository, EventCommitteeRepositoryImpl } from "./event/event-committee-repository"
import { type EventCommitteeService, EventCommitteeServiceImpl } from "./event/event-committee-service"
import { type EventCompanyRepository, EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { type EventCompanyService, EventCompanyServiceImpl } from "./event/event-company-service"
import { type EventRepository, EventRepositoryImpl } from "./event/event-repository"
import { type EventService, EventServiceImpl } from "./event/event-service"
import { type Auth0Repository, Auth0RepositoryImpl } from "./external/auth0-repository"
import { type S3Repository, S3RepositoryImpl } from "./external/s3-repository"
import { type InterestGroupRepository, InterestGroupRepositoryImpl } from "./interest-group/interest-group-repository"
import { type InterestGroupService, InterestGroupServiceImpl } from "./interest-group/interest-group-service"
import {
  type JobListingLocationLinkRepository,
  JobListingLocationLinkRepositoryImpl,
} from "./job-listing/job-listing-location-link-repository"
import {
  type JobListingLocationRepository,
  JobListingLocationRepositoryImpl,
} from "./job-listing/job-listing-location-repository"
import { type JobListingRepository, JobListingRepositoryImpl } from "./job-listing/job-listing-repository"
import { type JobListingService, JobListingServiceImpl } from "./job-listing/job-listing-service"
import { type MarkRepository, MarkRepositoryImpl } from "./mark/mark-repository"
import { type MarkService, MarkServiceImpl } from "./mark/mark-service"
import { type PersonalMarkRepository, PersonalMarkRepositoryImpl } from "./mark/personal-mark-repository"
import { type PersonalMarkService, PersonalMarkServiceImpl } from "./mark/personal-mark-service"
import { type OfflineRepository, OfflineRepositoryImpl } from "./offline/offline-repository"
import { type OfflineService, OfflineServiceImpl } from "./offline/offline-service"
import { type PaymentRepository, PaymentRepositoryImpl } from "./payment/payment-repository"
import { type PaymentService, PaymentServiceImpl } from "./payment/payment-service"
import {
  type ProductPaymentProviderRepository,
  ProductPaymentProviderRepositoryImpl,
} from "./payment/product-payment-provider-repository"
import {
  type ProductPaymentProviderService,
  ProductPaymentProviderServiceImpl,
} from "./payment/product-payment-provider-service"
import { type ProductRepository, ProductRepositoryImpl } from "./payment/product-repository"
import { type ProductService, ProductServiceImpl } from "./payment/product-service"
import { type RefundRequestRepository, RefundRequestRepositoryImpl } from "./payment/refund-request-repository"
import { type RefundRequestService, RefundRequestServiceImpl } from "./payment/refund-request-service"
import { type StaticAssetRepository, StaticAssetRepositoryImpl } from "./static-asset/static-asset-repository"
import { type Auth0SynchronizationService, Auth0SynchronizationServiceImpl } from "./user/auth0-synchronization-service"
import {
  type NotificationPermissionsRepository,
  NotificationPermissionsRepositoryImpl,
} from "./user/notification-permissions-repository"
import {
  type PrivacyPermissionsRepository,
  PrivacyPermissionsRepositoryImpl,
} from "./user/privacy-permissions-repository"
import { type UserRepository, UserRepositoryImpl } from "./user/user-repository"
import { type UserService, UserServiceImpl } from "./user/user-service"
import { type StaticAssetService, StaticAssetServiceImpl } from "./static-asset/static-asset-service"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export interface ServerLayerOptions {
  db: Kysely<Database>
}

export const createServiceLayer = async ({ db }: ServerLayerOptions) => {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
  })
  const auth0ManagementClient = new ManagementClient({
    domain: "onlineweb.eu.auth0.com",
    clientSecret: env.GTX_AUTH0_CLIENT_SECRET,
    clientId: env.GTX_AUTH0_CLIENT_ID,
  })
  const trikomStripeSdk = new Stripe(env.TRIKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" })
  const fagkomStripeSdk = new Stripe(env.FAGKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" })
  const stripeAccounts = {
    trikom: {
      stripe: trikomStripeSdk,
      publicKey: env.TRIKOM_STRIPE_PUBLIC_KEY,
      webhookSecret: env.TRIKOM_STRIPE_WEBHOOK_SECRET,
    },
    fagkom: {
      stripe: fagkomStripeSdk,
      publicKey: env.FAGKOM_STRIPE_PUBLIC_KEY,
      webhookSecret: env.FAGKOM_STRIPE_WEBHOOK_SECRET,
    },
  }

  const s3Repository: S3Repository = new S3RepositoryImpl(s3Client)
  const auth0Repository: Auth0Repository = new Auth0RepositoryImpl(auth0ManagementClient)
  const eventRepository: EventRepository = new EventRepositoryImpl(db)
  const committeeRepository: CommitteeRepository = new CommitteeRepositoryImpl(db)
  const jobListingRepository: JobListingRepository = new JobListingRepositoryImpl(db)
  const jobListingLocationRepository: JobListingLocationRepository = new JobListingLocationRepositoryImpl(db)
  const jobListingLocationLinkRepository: JobListingLocationLinkRepository = new JobListingLocationLinkRepositoryImpl(
    db
  )
  const companyRepository: CompanyRepository = new CompanyRepositoryImpl(db)
  const companyEventRepository: CompanyEventRepository = new CompanyEventRepositoryImpl(db)
  const eventCompanyRepository: EventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const committeeOrganizerRepository: EventCommitteeRepository = new EventCommitteeRepositoryImpl(db)

  const userRepository: UserRepository = new UserRepositoryImpl(db)

  const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl(db)
  const attendancePoolRepository: AttendancePoolRepository = new AttendancePoolRepositoryImpl(db)
  const waitlistAttendeRepository: WaitlistAttendeRepository = new WaitlistAttendeRepositoryImpl(db)
  const attendeeRepository: AttendeeRepository = new AttendeeRepositoryImpl(db)

  const productRepository: ProductRepository = new ProductRepositoryImpl(db)
  const paymentRepository: PaymentRepository = new PaymentRepositoryImpl(db)
  const productPaymentProviderRepository: ProductPaymentProviderRepository = new ProductPaymentProviderRepositoryImpl(
    db
  )
  const refundRequestRepository: RefundRequestRepository = new RefundRequestRepositoryImpl(db)
  const markRepository: MarkRepository = new MarkRepositoryImpl(db)
  const personalMarkRepository: PersonalMarkRepository = new PersonalMarkRepositoryImpl(db)
  const privacyPermissionsRepository: PrivacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository: NotificationPermissionsRepository =
    new NotificationPermissionsRepositoryImpl(db)
  const offlineRepository: OfflineRepository = new OfflineRepositoryImpl(db)
  const articleRepository: ArticleRepository = new ArticleRepositoryImpl(db)
  const articleTagRepository: ArticleTagRepository = new ArticleTagRepositoryImpl(db)
  const articleTagLinkRepository: ArticleTagLinkRepository = new ArticleTagLinkRepositoryImpl(db)

  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository
  )

  const auth0SynchronizationService: Auth0SynchronizationService = new Auth0SynchronizationServiceImpl(
    userService,
    auth0Repository
  )

  const eventCommitteeService: EventCommitteeService = new EventCommitteeServiceImpl(committeeOrganizerRepository)
  const committeeService: CommitteeService = new CommitteeServiceImpl(committeeRepository)
  const jobListingService: JobListingService = new JobListingServiceImpl(
    jobListingRepository,
    jobListingLocationRepository,
    jobListingLocationLinkRepository
  )

  const attendanceService: AttendanceService = new AttendanceServiceImpl(
    attendanceRepository,
    attendeeRepository,
    waitlistAttendeRepository,
    attendancePoolRepository
  )

  const waitlistAttendeService: WaitlistAttendeService = new WaitlistAttendeServiceImpl(
    waitlistAttendeRepository,
    attendancePoolRepository
  )

  const attendeeService: AttendeeService = new AttendeeServiceImpl(
    attendeeRepository,
    attendancePoolRepository,
    attendanceRepository,
    userService,
    waitlistAttendeService
  )
  const attendancePoolService: AttendancePoolService = new AttendancePoolServiceImpl(
    attendancePoolRepository,
    attendeeService
  )

  const eventCompanyService: EventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const eventService: EventService = new EventServiceImpl(
    eventRepository,
    attendanceService,
    attendancePoolService,
    eventCommitteeService,
    eventCompanyService
  )
  const companyService: CompanyService = new CompanyServiceImpl(companyRepository)
  const companyEventService: CompanyEventService = new CompanyEventServiceImpl(companyEventRepository)
  const productService: ProductService = new ProductServiceImpl(productRepository)
  const paymentService: PaymentService = new PaymentServiceImpl(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository,
    stripeAccounts
  )
  const productPaymentProviderService: ProductPaymentProviderService = new ProductPaymentProviderServiceImpl(
    productPaymentProviderRepository
  )
  const refundRequestService: RefundRequestService = new RefundRequestServiceImpl(
    refundRequestRepository,
    paymentRepository,
    productRepository,
    paymentService
  )
  const markService: MarkService = new MarkServiceImpl(markRepository)
  const personalMarkService: PersonalMarkService = new PersonalMarkServiceImpl(personalMarkRepository, markService)
  const offlineService: OfflineService = new OfflineServiceImpl(offlineRepository, s3Repository)
  const articleService: ArticleService = new ArticleServiceImpl(
    articleRepository,
    articleTagRepository,
    articleTagLinkRepository
  )
  const interestGroupRepository: InterestGroupRepository = new InterestGroupRepositoryImpl(db)
  const interestGroupService: InterestGroupService = new InterestGroupServiceImpl(interestGroupRepository)

  const staticAssetRepository: StaticAssetRepository = new StaticAssetRepositoryImpl(db)
  const staticAssetService: StaticAssetService = new StaticAssetServiceImpl(staticAssetRepository, s3Client)

  return {
    userService,
    eventService,
    committeeService,
    companyService,
    companyEventService,
    eventCompanyService,
    productService,
    paymentService,
    productPaymentProviderService,
    refundRequestService,
    markService,
    personalMarkService,
    eventCommitteeService,
    jobListingService,
    offlineService,
    articleService,
    attendanceService,
    attendanceRepository,
    attendancePoolService,
    waitlistAttendeService,
    attendeeService,
    interestGroupRepository,
    interestGroupService,
    auth0SynchronizationService,
    staticAssetService,
  }
}
