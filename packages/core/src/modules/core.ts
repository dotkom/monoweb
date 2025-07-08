import type { S3Client } from "@aws-sdk/client-s3"
import type { DBClient } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import type Stripe from "stripe"
import { getArticleRepository } from "./article/article-repository"
import { getArticleService } from "./article/article-service"
import { getArticleTagLinkRepository } from "./article/article-tag-link-repository"
import { getArticleTagRepository } from "./article/article-tag-repository"
import { getAttendanceRepository } from "./attendance/attendance-repository"
import { getAttendanceService } from "./attendance/attendance-service"
import { getAttendeeRepository } from "./attendance/attendee-repository"
import { getAttendeeService } from "./attendance/attendee-service"
import { getCompanyEventRepository } from "./company/company-event-repository"
import { getCompanyEventService } from "./company/company-event-service"
import { getCompanyRepository } from "./company/company-repository"
import { getCompanyService } from "./company/company-service"
import { getEventCompanyRepository } from "./event/event-company-repository"
import { getEventCompanyService } from "./event/event-company-service"
import { getEventHostingGroupRepository } from "./event/event-hosting-group-repository"
import { getEventHostingGroupService } from "./event/event-hosting-group-service"
import { getEventRepository } from "./event/event-repository"
import { getEventService } from "./event/event-service"
import { type S3Repository, S3RepositoryImpl } from "./external/s3-repository"
import { FeedbackFormAnswerRepositoryImpl } from "./feedback-form/feedback-form-answer-repository"
import {
  type FeedbackFormAnswerService,
  FeedbackFormAnswerServiceImpl,
} from "./feedback-form/feedback-form-answer-service"
import { FeedbackFormRepositoryImpl } from "./feedback-form/feedback-form-repository"
import { type FeedbackFormService, FeedbackFormServiceImpl } from "./feedback-form/feedback-form-service"
import { getFeideGroupsRepository } from "./feide/feide-groups-repository"
import { getGroupRepository } from "./group/group-repository"
import { getGroupService } from "./group/group-service"
import { getInterestGroupRepository } from "./interest-group/interest-group-repository"
import { getInterestGroupService } from "./interest-group/interest-group-service"
import { getJobListingRepository } from "./job-listing/job-listing-repository"
import { getJobListingService } from "./job-listing/job-listing-service"
import { JobExecutor } from "./job/job-executor"
import { getJobRepository } from "./job/job-repository"
import { getJobService } from "./job/job-service"
import { getMarkRepository } from "./mark/mark-repository"
import { getMarkService } from "./mark/mark-service"
import { getPersonalMarkRepository } from "./mark/personal-mark-repository"
import { getPersonalMarkService } from "./mark/personal-mark-service"
import { getNTNUStudyplanRepository } from "./ntnu-study-plan/ntnu-study-plan-repository"
import { getOfflineRepository } from "./offline/offline-repository"
import { getOfflineService } from "./offline/offline-service"
import { getPaymentRepository } from "./payment/payment-repository"
import { getPaymentService } from "./payment/payment-service"
import { getProductPaymentProviderRepository } from "./payment/product-payment-provider-repository"
import { getProductPaymentProviderService } from "./payment/product-payment-provider-service"
import { getProductRepository } from "./payment/product-repository"
import { getProductService } from "./payment/product-service"
import { getRefundRequestRepository } from "./payment/refund-request-repository"
import { getRefundRequestService } from "./payment/refund-request-service"
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
  const jobRepository = getJobRepository()
  const jobService = getJobService(jobRepository)

  const s3Repository: S3Repository = new S3RepositoryImpl(s3Client, s3BucketName)
  const eventRepository = getEventRepository()
  const groupRepository = getGroupRepository()
  const jobListingRepository = getJobListingRepository()
  const companyRepository = getCompanyRepository()
  const companyEventRepository = getCompanyEventRepository()
  const eventCompanyRepository = getEventCompanyRepository()
  const eventHostingGroupRepository = getEventHostingGroupRepository()
  const userRepository = getUserRepository(managementClient)
  const attendanceRepository = getAttendanceRepository()
  const attendeeRepository = getAttendeeRepository()
  const productRepository = getProductRepository()
  const paymentRepository = getPaymentRepository()
  const productPaymentProviderRepository = getProductPaymentProviderRepository()
  const refundRequestRepository = getRefundRequestRepository()
  const markRepository = getMarkRepository()
  const personalMarkRepository = getPersonalMarkRepository()
  const privacyPermissionsRepository = getPrivacyPermissionsRepository()
  const notificationPermissionsRepository = getNotificationPermissionsRepository()
  const offlineRepository = getOfflineRepository()
  const articleRepository = getArticleRepository()
  const articleTagRepository = getArticleTagRepository()
  const articleTagLinkRepository = getArticleTagLinkRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const ntnuStudyplanRepository = getNTNUStudyplanRepository()
  const feedbackFormRepository = new FeedbackFormRepositoryImpl(db)
  const feedbackFormAnswerRepository = new FeedbackFormAnswerRepositoryImpl(db)

  const userService = getUserService(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    feideGroupsRepository,
    ntnuStudyplanRepository
  )
  const eventHostingGroupService = getEventHostingGroupService(eventHostingGroupRepository)
  const groupService = getGroupService(groupRepository)
  const jobListingService = getJobListingService(jobListingRepository)
  const attendeeService = getAttendeeService(attendeeRepository, attendanceRepository, userService, jobService)
  const attendanceService = getAttendanceService(attendanceRepository, attendeeRepository, attendeeService, jobService)
  const interestGroupRepository = getInterestGroupRepository()
  const interestGroupService = getInterestGroupService(interestGroupRepository)
  const eventCompanyService = getEventCompanyService(eventCompanyRepository)
  const eventService = getEventService(
    eventRepository,
    attendanceService,
    eventCompanyService,
    eventHostingGroupService,
    interestGroupService
  )
  const companyService = getCompanyService(companyRepository)
  const companyEventService = getCompanyEventService(companyEventRepository, attendanceService)
  const productService = getProductService(productRepository)
  const paymentService = getPaymentService(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository,
    stripeAccounts
  )
  const productPaymentProviderService = getProductPaymentProviderService(productPaymentProviderRepository)
  const refundRequestService = getRefundRequestService(
    refundRequestRepository,
    paymentRepository,
    productRepository,
    paymentService
  )
  const markService = getMarkService(markRepository)
  const personalMarkService = getPersonalMarkService(personalMarkRepository, markService)
  const offlineService = getOfflineService(offlineRepository, s3Repository)
  const articleService = getArticleService(articleRepository, articleTagRepository, articleTagLinkRepository)

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
    executeTransaction: db.$transaction.bind(db),
  }
}
