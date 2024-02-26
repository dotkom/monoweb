import { type Database } from "@dotkomonline/db"
import { type Kysely } from "kysely"
import { ArticleRepositoryImpl, type ArticleRepository } from "./article/article-repository"
import { ArticleServiceImpl, type ArticleService } from "./article/article-service"
import { ArticleTagLinkRepositoryImpl, type ArticleTagLinkRepository } from "./article/article-tag-link-repository"
import { ArticleTagRepositoryImpl, type ArticleTagRepository } from "./article/article-tag-repository"
import { CommitteeRepositoryImpl, type CommitteeRepository } from "./committee/committee-repository"
import { CommitteeServiceImpl, type CommitteeService } from "./committee/committee-service"
import { CompanyEventRepositoryImpl, type CompanyEventRepository } from "./company/company-event-repository"
import { CompanyEventServiceImpl, type CompanyEventService } from "./company/company-event-service"
import { CompanyRepositoryImpl, type CompanyRepository } from "./company/company-repository"
import { CompanyServiceImpl, type CompanyService } from "./company/company-service"
import { AttendanceRepositoryImpl, type AttendanceRepository } from "./attendance/attendance-repository"
import { AttendanceServiceImpl, type AttendanceService } from "./attendance/attendance-service"
import { EventCommitteeRepositoryImpl, type EventCommitteeRepository } from "./event/event-committee-repository"
import { EventCommitteeServiceImpl, type EventCommitteeService } from "./event/event-committee-service"
import { EventCompanyRepositoryImpl, type EventCompanyRepository } from "./event/event-company-repository"
import { EventCompanyServiceImpl, type EventCompanyService } from "./event/event-company-service"
import { EventRepositoryImpl, type EventRepository } from "./event/event-repository"
import { EventServiceImpl, type EventService } from "./event/event-service"
import {
  JobListingLocationLinkRepositoryImpl,
  type JobListingLocationLinkRepository,
} from "./job-listing/job-listing-location-link-repository"
import {
  JobListingLocationRepositoryImpl,
  type JobListingLocationRepository,
} from "./job-listing/job-listing-location-repository"
import { JobListingRepositoryImpl, type JobListingRepository } from "./job-listing/job-listing-repository"
import { JobListingServiceImpl, type JobListingService } from "./job-listing/job-listing-service"
import { MarkRepositoryImpl, type MarkRepository } from "./mark/mark-repository"
import { MarkServiceImpl, type MarkService } from "./mark/mark-service"
import { PersonalMarkRepositoryImpl, type PersonalMarkRepository } from "./mark/personal-mark-repository"
import { PersonalMarkServiceImpl, type PersonalMarkService } from "./mark/personal-mark-service"
import { OfflineRepositoryImpl, type OfflineRepository } from "./offline/offline-repository"
import { OfflineServiceImpl, type OfflineService } from "./offline/offline-service"
import { PaymentRepositoryImpl, type PaymentRepository } from "./payment/payment-repository"
import { PaymentServiceImpl, type PaymentService } from "./payment/payment-service"
import {
  ProductPaymentProviderRepositoryImpl,
  type ProductPaymentProviderRepository,
} from "./payment/product-payment-provider-repository"
import {
  ProductPaymentProviderServiceImpl,
  type ProductPaymentProviderService,
} from "./payment/product-payment-provider-service"
import { ProductRepositoryImpl, type ProductRepository } from "./payment/product-repository"
import { ProductServiceImpl, type ProductService } from "./payment/product-service"
import { RefundRequestRepositoryImpl, type RefundRequestRepository } from "./payment/refund-request-repository"
import { RefundRequestServiceImpl, type RefundRequestService } from "./payment/refund-request-service"
import {
  NotificationPermissionsRepositoryImpl,
  type NotificationPermissionsRepository,
} from "./user/notification-permissions-repository"
import {
  PrivacyPermissionsRepositoryImpl,
  type PrivacyPermissionsRepository,
} from "./user/privacy-permissions-repository"
import { UserRepositoryImpl, type UserRepository } from "./user/user-repository"
import { UserServiceImpl, type UserService } from "./user/user-service"
import { Auth0IDPRepositoryImpl, type IDPRepository } from "../lib/IDP-repository"
import { s3RepositoryImpl, type S3Repository } from "../lib/s3/s3-repository"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export interface ServerLayerOptions {
  db: Kysely<Database>
}

export const createServiceLayer = async ({ db }: ServerLayerOptions) => {
  const s3Repository: S3Repository = new s3RepositoryImpl()
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
  const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl(db)
  const userRepository: UserRepository = new UserRepositoryImpl(db)
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
  const auth0Repository: IDPRepository = new Auth0IDPRepositoryImpl()

  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    auth0Repository
  )
  const eventService: EventService = new EventServiceImpl(eventRepository, attendanceRepository, userService)
  const eventCommitteeService: EventCommitteeService = new EventCommitteeServiceImpl(committeeOrganizerRepository)
  const attendanceService: AttendanceService = new AttendanceServiceImpl(attendanceRepository, db, userService)
  const committeeService: CommitteeService = new CommitteeServiceImpl(committeeRepository)
  const jobListingService: JobListingService = new JobListingServiceImpl(
    jobListingRepository,
    jobListingLocationRepository,
    jobListingLocationLinkRepository
  )
  const companyService: CompanyService = new CompanyServiceImpl(companyRepository)
  const companyEventService: CompanyEventService = new CompanyEventServiceImpl(companyEventRepository)
  const eventCompanyService: EventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const productService: ProductService = new ProductServiceImpl(productRepository)
  const paymentService: PaymentService = new PaymentServiceImpl(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository
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

  return {
    userService,
    eventService,
    committeeService,
    companyService,
    attendanceService,
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
  }
}
