import { S3Client } from "@aws-sdk/client-s3"
import { createPrisma } from "@dotkomonline/db"
import { ManagementClient } from "auth0"
import Stripe from "stripe"
import type { Configuration } from "../configuration"
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
import { getFeedbackFormAnswerRepository } from "./feedback-form/feedback-form-answer-repository"
import { getFeedbackFormAnswerService } from "./feedback-form/feedback-form-answer-service"
import { getFeedbackFormRepository } from "./feedback-form/feedback-form-repository"
import { getFeedbackFormService } from "./feedback-form/feedback-form-service"
import { getFeideGroupsRepository } from "./feide/feide-groups-repository"
import { getGroupRepository } from "./group/group-repository"
import { getGroupService } from "./group/group-service"
import { getInterestGroupRepository } from "./interest-group/interest-group-repository"
import { getInterestGroupService } from "./interest-group/interest-group-service"
import { getJobListingRepository } from "./job-listing/job-listing-repository"
import { getJobListingService } from "./job-listing/job-listing-service"
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
import { getLocalTaskDiscoveryService } from "./task/task-discovery-service"
import { getLocalTaskExecutor } from "./task/task-executor"
import { getTaskRepository } from "./task/task-repository"
import { getLocalTaskSchedulingService } from "./task/task-scheduling-service"
import { getTaskService } from "./task/task-service"
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

/** Build API clients for third-party services like S3, Auth0, and Stripe. */
export function createThirdPartyClients(configuration: Configuration) {
  const s3Client = new S3Client({ region: configuration.AWS_REGION })
  const auth0Client = new ManagementClient({
    domain: configuration.AUTH0_MGMT_TENANT,
    clientId: configuration.AUTH0_CLIENT_ID,
    clientSecret: configuration.AUTH0_CLIENT_SECRET,
  })
  const stripeAccounts = {
    trikom: {
      stripe: new Stripe(configuration.TRIKOM_STRIPE_SECRET_KEY, {
        apiVersion: "2023-08-16",
      }),
      publicKey: configuration.TRIKOM_STRIPE_PUBLIC_KEY,
      webhookSecret: configuration.TRIKOM_STRIPE_WEBHOOK_SECRET,
    },
    fagkom: {
      stripe: new Stripe(configuration.FAGKOM_STRIPE_SECRET_KEY, {
        apiVersion: "2023-08-16",
      }),
      publicKey: configuration.FAGKOM_STRIPE_PUBLIC_KEY,
      webhookSecret: configuration.FAGKOM_STRIPE_WEBHOOK_SECRET,
    },
  }
  const prisma = createPrisma(configuration.DATABASE_URL)
  return { s3Client, auth0Client, stripeAccounts, prisma }
}

/**
 * Build the services for the application.
 *
 * In computer science terms this is building a dependency graph. The name comes from the fact that we are instantiating
 * several components (service, repository, etc.) that depend on each other, but form a directed acyclic graph (DAG).
 *
 * For ease of mocking and testing, the function does not construct third-party clients like the AWS S3 client or the
 * Auth0 Management client. Instead it takes a `clients` parameter that holds the clients. This allows us to mock them
 * in tests without having to mock the entire service layer.
 */
export async function createServiceLayer(
  clients: ReturnType<typeof createThirdPartyClients>,
  configuration: Configuration
) {
  const taskRepository = getTaskRepository()
  const taskService = getTaskService(taskRepository)
  const taskSchedulingService = getLocalTaskSchedulingService(taskRepository, taskService)
  const eventRepository = getEventRepository()
  const groupRepository = getGroupRepository()
  const jobListingRepository = getJobListingRepository()
  const companyRepository = getCompanyRepository()
  const companyEventRepository = getCompanyEventRepository()
  const eventCompanyRepository = getEventCompanyRepository()
  const eventHostingGroupRepository = getEventHostingGroupRepository()
  const userRepository = getUserRepository(clients.auth0Client)
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
  const feedbackFormRepository = getFeedbackFormRepository()
  const feedbackFormAnswerRepository = getFeedbackFormAnswerRepository()

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
  const attendeeService = getAttendeeService(
    attendeeRepository,
    attendanceRepository,
    userService,
    taskSchedulingService
  )
  const attendanceService = getAttendanceService(
    attendanceRepository,
    attendeeRepository,
    attendeeService,
    taskSchedulingService
  )
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
    clients.stripeAccounts
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
  const offlineService = getOfflineService(offlineRepository, clients.s3Client, configuration.AWS_S3_BUCKET)
  const articleService = getArticleService(articleRepository, articleTagRepository, articleTagLinkRepository)
  const feedbackFormService = getFeedbackFormService(feedbackFormRepository)
  const feedbackFormAnswerService = getFeedbackFormAnswerService(feedbackFormAnswerRepository)
  const taskDiscoveryService = getLocalTaskDiscoveryService(clients.prisma, taskService)
  const taskExecutor = getLocalTaskExecutor(taskService, taskDiscoveryService, attendanceService)

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
    taskService,
    taskExecutor,
    feedbackFormService,
    feedbackFormAnswerService,
    executeTransaction: clients.prisma.$transaction.bind(clients.prisma),
    startTaskExecutor: () => taskExecutor.start(clients.prisma),
    // Do not use this directly, it is here for repl/script purposes only
    prisma: clients.prisma,
  }
}
