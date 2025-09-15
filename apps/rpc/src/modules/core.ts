import EventEmitter from "node:events"
import { S3Client } from "@aws-sdk/client-s3"
import { createPrisma } from "@dotkomonline/db"
import { ManagementClient } from "auth0"
import { type admin_directory_v1, google } from "googleapis"
import Stripe from "stripe"
import z from "zod"
import { type Configuration, configuration } from "../configuration"
import { getArticleRepository } from "./article/article-repository"
import { getArticleService } from "./article/article-service"
import { getArticleTagLinkRepository } from "./article/article-tag-link-repository"
import { getArticleTagRepository } from "./article/article-tag-repository"
import { getAuthorizationService } from "./authorization-service"
import { getCompanyRepository } from "./company/company-repository"
import { getCompanyService } from "./company/company-service"
import { getAttendanceRepository } from "./event/attendance-repository"
import { getAttendanceService } from "./event/attendance-service"
import { getEventRepository } from "./event/event-repository"
import { getEventService } from "./event/event-service"
import { getFeedbackFormAnswerRepository } from "./feedback-form/feedback-form-answer-repository"
import { getFeedbackFormAnswerService } from "./feedback-form/feedback-form-answer-service"
import { getFeedbackFormRepository } from "./feedback-form/feedback-form-repository"
import { getFeedbackFormService } from "./feedback-form/feedback-form-service"
import { getFeideGroupsRepository } from "./feide/feide-groups-repository"
import { getGroupRepository } from "./group/group-repository"
import { getGroupService } from "./group/group-service"
import { getJobListingRepository } from "./job-listing/job-listing-repository"
import { getJobListingService } from "./job-listing/job-listing-service"
import { getMarkRepository } from "./mark/mark-repository"
import { getMarkService } from "./mark/mark-service"
import { getPersonalMarkRepository } from "./mark/personal-mark-repository"
import { getPersonalMarkService } from "./mark/personal-mark-service"
import { getNTNUStudyplanRepository } from "./ntnu-study-plan/ntnu-study-plan-repository"
import { getOfflineRepository } from "./offline/offline-repository"
import { getOfflineService } from "./offline/offline-service"
import { getPaymentProductsService } from "./payment/payment-products-service"
import { getPaymentService } from "./payment/payment-service"
import { getPaymentWebhookService } from "./payment/payment-webhook-service"
import { getLocalTaskDiscoveryService } from "./task/task-discovery-service"
import { getLocalTaskExecutor } from "./task/task-executor"
import { getTaskRepository } from "./task/task-repository"
import { getLocalTaskSchedulingService } from "./task/task-scheduling-service"
import { getTaskService } from "./task/task-service"
import { getNotificationPermissionsRepository } from "./user/notification-permissions-repository"
import { getPrivacyPermissionsRepository } from "./user/privacy-permissions-repository"
import { getUserRepository } from "./user/user-repository"
import { getUserService } from "./user/user-service"
import { MalformedWorkspaceServiceAccountError, WorkspaceNotEnabledError } from "./workspace-sync/workspace-error"
import { getWorkspaceService } from "./workspace-sync/workspace-service"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

const WORKSPACE_SERVICE_ACCOUNT_SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.group",
  "https://www.googleapis.com/auth/admin.directory.group.member",
  "https://www.googleapis.com/auth/admin.directory.user",
  "https://www.googleapis.com/auth/admin.directory.user.alias",
  "https://www.googleapis.com/auth/admin.directory.user.security",
]

const workspaceServiceAccountJsonSchema = z.object({
  auth_provider_x509_cert_url: z.string().url(),
  auth_uri: z.string().url(),
  client_email: z.string().email(),
  client_id: z.string().min(1),
  client_x509_cert_url: z.string().url(),
  private_key: z.string().min(1),
  private_key_id: z.string().min(1),
  project_id: z.string().min(1),
  token_uri: z.string().url(),
  type: z.literal("service_account"),
})

export function getDirectory(): admin_directory_v1.Admin {
  if (
    !configuration.WORKSPACE_ENABLED ||
    configuration.WORKSPACE_SERVICE_ACCOUNT === null ||
    configuration.WORKSPACE_USER_ACCOUNT_EMAIL === null
  ) {
    throw new WorkspaceNotEnabledError()
  }

  const serviceAccountJson = JSON.parse(configuration.WORKSPACE_SERVICE_ACCOUNT)
  const result = workspaceServiceAccountJsonSchema.safeParse(serviceAccountJson)

  if (!result.success) {
    throw new MalformedWorkspaceServiceAccountError(result.error.message)
  }

  const auth = new google.auth.JWT({
    email: result.data.client_email,
    key: result.data.private_key,
    scopes: WORKSPACE_SERVICE_ACCOUNT_SCOPES,
    subject: configuration.WORKSPACE_USER_ACCOUNT_EMAIL,
  })

  return google.admin({ version: "directory_v1", auth })
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
  const workspaceDirectory = configuration.WORKSPACE_ENABLED ? getDirectory() : null
  return { s3Client, auth0Client, stripe, prisma, workspaceDirectory }
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

  const workspaceService = configuration.WORKSPACE_ENABLED
    ? getWorkspaceService(clients.workspaceDirectory, userService, groupService)
    : null

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
    workspaceService,
    executeTransaction: clients.prisma.$transaction.bind(clients.prisma),
    startTaskExecutor: () => taskExecutor.start(clients.prisma),
    // Do not use this directly, it is here for repl/script purposes only
    prisma: clients.prisma,
  }
}
