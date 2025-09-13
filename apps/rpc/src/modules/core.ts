import EventEmitter from "node:events"
import { S3Client } from "@aws-sdk/client-s3"
import { createPrisma } from "@dotkomonline/db"
import { ManagementClient } from "auth0"
import Stripe from "stripe"
import type { Configuration } from "../configuration.ts"
import { getArticleRepository } from "./article/article-repository.ts"
import { getArticleService } from "./article/article-service.ts"
import { getArticleTagLinkRepository } from "./article/article-tag-link-repository.ts"
import { getArticleTagRepository } from "./article/article-tag-repository.ts"
import { getAuthorizationService } from "./authorization-service.ts"
import { getCompanyRepository } from "./company/company-repository.ts"
import { getCompanyService } from "./company/company-service.ts"
import { getAttendanceRepository } from "./event/attendance-repository.ts"
import { getAttendanceService } from "./event/attendance-service.ts"
import { getEventRepository } from "./event/event-repository.ts"
import { getEventService } from "./event/event-service.ts"
import { getFeedbackFormAnswerRepository } from "./feedback-form/feedback-form-answer-repository.ts"
import { getFeedbackFormAnswerService } from "./feedback-form/feedback-form-answer-service.ts"
import { getFeedbackFormRepository } from "./feedback-form/feedback-form-repository.ts"
import { getFeedbackFormService } from "./feedback-form/feedback-form-service.ts"
import { getFeideGroupsRepository } from "./feide/feide-groups-repository.ts"
import { getGroupRepository } from "./group/group-repository.ts"
import { getGroupService } from "./group/group-service.ts"
import { getJobListingRepository } from "./job-listing/job-listing-repository.ts"
import { getJobListingService } from "./job-listing/job-listing-service.ts"
import { getMarkRepository } from "./mark/mark-repository.ts"
import { getMarkService } from "./mark/mark-service.ts"
import { getPersonalMarkRepository } from "./mark/personal-mark-repository.ts"
import { getPersonalMarkService } from "./mark/personal-mark-service.ts"
import { getNTNUStudyplanRepository } from "./ntnu-study-plan/ntnu-study-plan-repository.ts"
import { getOfflineRepository } from "./offline/offline-repository.ts"
import { getOfflineService } from "./offline/offline-service.ts"
import { getPaymentProductsService } from "./payment/payment-products-service.ts"
import { getPaymentService } from "./payment/payment-service.ts"
import { getPaymentWebhookService } from "./payment/payment-webhook-service.ts"
import { getLocalTaskDiscoveryService } from "./task/task-discovery-service.ts"
import { getLocalTaskExecutor } from "./task/task-executor.ts"
import { getTaskRepository } from "./task/task-repository.ts"
import { getLocalTaskSchedulingService } from "./task/task-scheduling-service.ts"
import { getTaskService } from "./task/task-service.ts"
import { getNotificationPermissionsRepository } from "./user/notification-permissions-repository.ts"
import { getPrivacyPermissionsRepository } from "./user/privacy-permissions-repository.ts"
import { getUserRepository } from "./user/user-repository.ts"
import { getUserService } from "./user/user-service.ts"

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
  const stripe = new Stripe(configuration.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  })
  const prisma = createPrisma(configuration.DATABASE_URL)
  return { s3Client, auth0Client, stripe, prisma }
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
  const eventEmitter = new EventEmitter()

  const taskRepository = getTaskRepository()
  const taskService = getTaskService(taskRepository)
  const taskSchedulingService = getLocalTaskSchedulingService(taskRepository, taskService)
  const eventRepository = getEventRepository()
  const groupRepository = getGroupRepository()
  const jobListingRepository = getJobListingRepository()
  const companyRepository = getCompanyRepository()
  const userRepository = getUserRepository()
  const attendanceRepository = getAttendanceRepository()
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
    ntnuStudyplanRepository,
    clients.auth0Client,
    clients.s3Client,
    configuration.AWS_S3_BUCKET
  )
  const groupService = getGroupService(groupRepository, userService)
  const jobListingService = getJobListingService(jobListingRepository)
  const markService = getMarkService(markRepository)
  const personalMarkService = getPersonalMarkService(personalMarkRepository, markService, groupService)
  const paymentService = getPaymentService(clients.stripe)
  const paymentProductsService = getPaymentProductsService(clients.stripe)
  const paymentWebhookService = getPaymentWebhookService(clients.stripe)
  const eventService = getEventService(eventRepository)
  const feedbackFormService = getFeedbackFormService(feedbackFormRepository, taskSchedulingService, eventService)
  const feedbackFormAnswerService = getFeedbackFormAnswerService(feedbackFormAnswerRepository, feedbackFormService)
  const taskDiscoveryService = getLocalTaskDiscoveryService(clients.prisma, taskService)
  const attendanceService = getAttendanceService(
    eventEmitter,
    attendanceRepository,
    taskSchedulingService,
    userService,
    markService,
    personalMarkService,
    paymentService,
    paymentProductsService,
    eventService,
    feedbackFormService,
    feedbackFormAnswerService,
    configuration
  )
  const companyService = getCompanyService(companyRepository)
  const offlineService = getOfflineService(offlineRepository, clients.s3Client, configuration.AWS_S3_BUCKET)
  const articleService = getArticleService(articleRepository, articleTagRepository, articleTagLinkRepository)
  const taskExecutor = getLocalTaskExecutor(taskService, taskDiscoveryService, attendanceService)
  const authorizationService = getAuthorizationService()

  return {
    eventEmitter,
    userService,
    eventService,
    groupService,
    companyService,
    markService,
    personalMarkService,
    jobListingService,
    offlineService,
    articleService,
    attendanceService,
    attendanceRepository,
    taskService,
    taskExecutor,
    feedbackFormService,
    feedbackFormAnswerService,
    authorizationService,
    paymentWebhookService,
    executeTransaction: clients.prisma.$transaction.bind(clients.prisma),
    startTaskExecutor: () => taskExecutor.start(clients.prisma),
    // Do not use this directly, it is here for repl/script purposes only
    prisma: clients.prisma,
  }
}
