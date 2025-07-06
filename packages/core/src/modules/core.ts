import type { S3Client } from "@aws-sdk/client-s3"
import type { DBClient } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import type Stripe from "stripe"
import { type ArticleRepository, ArticleRepositoryImpl } from "./article/article-repository"
import { type ArticleService, ArticleServiceImpl } from "./article/article-service"
import { type ArticleTagLinkRepository, ArticleTagLinkRepositoryImpl } from "./article/article-tag-link-repository"
import { type ArticleTagRepository, ArticleTagRepositoryImpl } from "./article/article-tag-repository"
import { type AttendanceRepository, AttendanceRepositoryImpl } from "./attendance/attendance-repository"
import { type AttendanceService, AttendanceServiceImpl } from "./attendance/attendance-service"
import { type AttendeeRepository, AttendeeRepositoryImpl } from "./attendance/attendee-repository"
import { type AttendeeService, AttendeeServiceImpl } from "./attendance/attendee-service"
import { type CompanyEventRepository, CompanyEventRepositoryImpl } from "./company/company-event-repository"
import { type CompanyEventService, CompanyEventServiceImpl } from "./company/company-event-service"
import { type CompanyRepository, CompanyRepositoryImpl } from "./company/company-repository"
import { type CompanyService, CompanyServiceImpl } from "./company/company-service"
import { type EventCompanyRepository, EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { type EventCompanyService, EventCompanyServiceImpl } from "./event/event-company-service"
import {
  type EventHostingGroupRepository,
  EventHostingGroupRepositoryImpl,
} from "./event/event-hosting-group-repository"
import { type EventHostingGroupService, EventHostingGroupServiceImpl } from "./event/event-hosting-group-service"
import { type EventRepository, EventRepositoryImpl } from "./event/event-repository"
import { type EventService, EventServiceImpl } from "./event/event-service"
import { type NTNUGroupsRepository, NTNUGroupsRepositoryImpl } from "./external/feide-groups-repository"
import {
  type NTNUStudyplanRepository,
  NTNUStudyplanRepositoryImpl,
} from "./external/ntnu-studyplan-repository/ntnu-studyplan-repository"
import { type S3Repository, S3RepositoryImpl } from "./external/s3-repository"
import {
  type FeedbackFormAnswerRepository,
  FeedbackFormAnswerRepositoryImpl,
} from "./feedback-form/feedback-form-answer-repository"
import {
  type FeedbackFormAnswerService,
  FeedbackFormAnswerServiceImpl,
} from "./feedback-form/feedback-form-answer-service"
import { type FeedbackFormRepository, FeedbackFormRepositoryImpl } from "./feedback-form/feedback-form-repository"
import { type FeedbackFormService, FeedbackFormServiceImpl } from "./feedback-form/feedback-form-service"
import { type GroupRepository, GroupRepositoryImpl } from "./group/group-repository"
import { type GroupService, GroupServiceImpl } from "./group/group-service"
import { type InterestGroupRepository, InterestGroupRepositoryImpl } from "./interest-group/interest-group-repository"
import { type InterestGroupService, InterestGroupServiceImpl } from "./interest-group/interest-group-service"
import { type JobListingRepository, JobListingRepositoryImpl } from "./job-listing/job-listing-repository"
import { type JobListingService, JobListingServiceImpl } from "./job-listing/job-listing-service"
import { JobExecutor } from "./job/job-executor"
import { type JobRepository, JobsRepositoryImpl } from "./job/job-repository"
import { type JobService, JobServiceImpl } from "./job/job-service"
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

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export type StripeAccount = {
  stripe: Stripe
  publicKey: string
  webhookSecret: string
}

export interface ServiceLayerOptions {
  db: DBClient
  s3Client: S3Client
  s3BucketName: string
  stripeAccounts: Record<string, StripeAccount>
  managementClient: ManagementClient
}

export const createServiceLayer = async ({
  db,
  s3Client,
  managementClient,
  stripeAccounts,
  s3BucketName,
}: ServiceLayerOptions) => {
  const jobRepository: JobRepository = new JobsRepositoryImpl(db)
  const jobService: JobService = new JobServiceImpl(jobRepository)

  const s3Repository: S3Repository = new S3RepositoryImpl(s3Client, s3BucketName)
  const eventRepository: EventRepository = new EventRepositoryImpl(db)
  const groupRepository: GroupRepository = new GroupRepositoryImpl(db)
  const jobListingRepository: JobListingRepository = new JobListingRepositoryImpl(db)
  const companyRepository: CompanyRepository = new CompanyRepositoryImpl(db)
  const companyEventRepository: CompanyEventRepository = new CompanyEventRepositoryImpl(db)
  const eventCompanyRepository: EventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const eventHostingGroupRepository: EventHostingGroupRepository = new EventHostingGroupRepositoryImpl(db)

  const userRepository: UserRepository = new UserRepositoryImpl(managementClient, db)

  const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl(db)
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

  const feideGroupsRepository: NTNUGroupsRepository = new NTNUGroupsRepositoryImpl()
  const ntnuStudyplanRepository: NTNUStudyplanRepository = new NTNUStudyplanRepositoryImpl()

  const feedbackFormRepository: FeedbackFormRepository = new FeedbackFormRepositoryImpl(db)

  const feedbackFormAnswerRepository: FeedbackFormAnswerRepository = new FeedbackFormAnswerRepositoryImpl(db)

  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    feideGroupsRepository,
    ntnuStudyplanRepository
  )

  const eventHostingGroupService: EventHostingGroupService = new EventHostingGroupServiceImpl(
    eventHostingGroupRepository
  )
  const groupService: GroupService = new GroupServiceImpl(groupRepository)
  const jobListingService: JobListingService = new JobListingServiceImpl(jobListingRepository)

  const attendeeService: AttendeeService = new AttendeeServiceImpl(
    attendeeRepository,
    attendanceRepository,
    userService,
    jobService
  )

  const attendanceService: AttendanceService = new AttendanceServiceImpl(
    attendanceRepository,
    attendeeRepository,
    attendeeService,
    jobService
  )
  const interestGroupRepository: InterestGroupRepository = new InterestGroupRepositoryImpl(db)
  const interestGroupService: InterestGroupService = new InterestGroupServiceImpl(interestGroupRepository)

  const eventCompanyService: EventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const eventService: EventService = new EventServiceImpl(
    eventRepository,
    attendanceService,
    eventCompanyService,
    eventHostingGroupService,
    interestGroupService
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

  const jobExecutor = new JobExecutor(jobService, attendeeService, attendanceService)

  const feedbackFormService: FeedbackFormService = new FeedbackFormServiceImpl(feedbackFormRepository)

  const feedbackFormAnswerService: FeedbackFormAnswerService = new FeedbackFormAnswerServiceImpl(
    feedbackFormAnswerRepository
  )

  return {
    userService,
    eventService,
    groupService,
    companyService,
    companyEventService,
    eventCompanyService,
    productService,
    paymentService,
    productPaymentProviderService,
    refundRequestService,
    markService,
    personalMarkService,
    eventHostingGroupService,
    jobListingService,
    offlineService,
    articleService,
    attendanceService,
    attendanceRepository,
    attendeeService,
    interestGroupRepository,
    interestGroupService,
    jobService,
    jobExecutor,
    feedbackFormService,
    feedbackFormAnswerService,
  }
}
