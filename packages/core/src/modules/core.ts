import type { S3Client } from "@aws-sdk/client-s3"
import type { DBClient } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import type Stripe from "stripe"
import { getArticleRepository } from "./article/article-repository"
import { getArticleService } from "./article/article-service"
import { getArticleTagLinkRepository } from "./article/article-tag-link-repository"
import { getArticleTagRepository } from "./article/article-tag-repository"
import { type AttendanceRepository, AttendanceRepositoryImpl } from "./attendance/attendance-repository"
import { type AttendanceService, AttendanceServiceImpl } from "./attendance/attendance-service"
import { type AttendeeRepository, AttendeeRepositoryImpl } from "./attendance/attendee-repository"
import { type AttendeeService, AttendeeServiceImpl } from "./attendance/attendee-service"
import { getCompanyEventRepository } from "./company/company-event-repository"
import { getCompanyEventService } from "./company/company-event-service"
import { getCompanyRepository } from "./company/company-repository"
import { getCompanyService } from "./company/company-service"
import { type EventCompanyRepository, EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { type EventCompanyService, EventCompanyServiceImpl } from "./event/event-company-service"
import {
  type EventHostingGroupRepository,
  EventHostingGroupRepositoryImpl,
} from "./event/event-hosting-group-repository"
import { type EventHostingGroupService, EventHostingGroupServiceImpl } from "./event/event-hosting-group-service"
import { type EventRepository, EventRepositoryImpl } from "./event/event-repository"
import { type EventService, EventServiceImpl } from "./event/event-service"
import { type S3Repository, S3RepositoryImpl } from "./external/s3-repository"
import { getFeideGroupsRepository } from "./feide/feide-groups-repository"
import { getGroupRepository } from "./group/group-repository"
import { getGroupService } from "./group/group-service"
import { getInterestGroupRepository } from "./interest-group/interest-group-repository"
import { getInterestGroupService } from "./interest-group/interest-group-service"
import { getJobListingRepository } from "./job-listing/job-listing-repository"
import { getJobListingService } from "./job-listing/job-listing-service"
import { JobExecutor } from "./job/job-executor"
import { type JobRepository, JobsRepositoryImpl } from "./job/job-repository"
import { type JobService, JobServiceImpl } from "./job/job-service"
import { type MarkRepository, MarkRepositoryImpl } from "./mark/mark-repository"
import { type MarkService, MarkServiceImpl } from "./mark/mark-service"
import { type PersonalMarkRepository, PersonalMarkRepositoryImpl } from "./mark/personal-mark-repository"
import { type PersonalMarkService, PersonalMarkServiceImpl } from "./mark/personal-mark-service"
import { getNTNUStudyplanRepository } from "./ntnu-study-plan/ntnu-study-plan-repository"
import { getOfflineRepository } from "./offline/offline-repository"
import { getOfflineService } from "./offline/offline-service"
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
import { getNotificationPermissionsRepository } from "./user/notification-permissions-repository"
import { getPrivacyPermissionsRepository } from "./user/privacy-permissions-repository"
import { getUserRepository } from "./user/user-repository"
import { getUserService } from "./user/user-service"

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
  const groupRepository = getGroupRepository()
  const jobListingRepository = getJobListingRepository()
  const companyRepository = getCompanyRepository()
  const companyEventRepository = getCompanyEventRepository()
  const eventCompanyRepository: EventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const eventHostingGroupRepository: EventHostingGroupRepository = new EventHostingGroupRepositoryImpl(db)
  const userRepository = getUserRepository(managementClient)

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
  const privacyPermissionsRepository = getPrivacyPermissionsRepository()
  const notificationPermissionsRepository = getNotificationPermissionsRepository()
  const offlineRepository = getOfflineRepository()
  const articleRepository = getArticleRepository()
  const articleTagRepository = getArticleTagRepository()
  const articleTagLinkRepository = getArticleTagLinkRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const ntnuStudyplanRepository = getNTNUStudyplanRepository()

  const userService = getUserService(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    feideGroupsRepository,
    ntnuStudyplanRepository
  )

  const eventHostingGroupService: EventHostingGroupService = new EventHostingGroupServiceImpl(
    eventHostingGroupRepository
  )
  const groupService = getGroupService(groupRepository)
  const jobListingService = getJobListingService(jobListingRepository)

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
  const interestGroupRepository = getInterestGroupRepository()
  const interestGroupService = getInterestGroupService(interestGroupRepository)

  const eventCompanyService: EventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const eventService: EventService = new EventServiceImpl(
    eventRepository,
    attendanceService,
    eventCompanyService,
    eventHostingGroupService,
    interestGroupService
  )
  const companyService = getCompanyService(companyRepository)
  const companyEventService = getCompanyEventService(companyEventRepository, attendanceService)
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
  const offlineService = getOfflineService(offlineRepository, s3Repository)
  const articleService = getArticleService(articleRepository, articleTagRepository, articleTagLinkRepository)

  const jobExecutor = new JobExecutor(jobService, attendeeService, attendanceService)

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
    executeTransaction: db.$transaction.bind(db),
  }
}
