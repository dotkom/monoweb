import { Database } from "@dotkomonline/db"
import { Kysely } from "kysely"
import { CommitteeRepositoryImpl } from "./committee/committee-repository"
import { CommitteeServiceImpl } from "./committee/committee-service"
import { CompanyRepositoryImpl } from "./company/company-repository"
import { CompanyServiceImpl } from "./company/company-service"
import { AttendanceRepositoryImpl } from "./event/attendance-repository"
import { AttendanceServiceImpl } from "./event/attendance-service"
import { EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { EventCompanyServiceImpl } from "./event/event-company-service"
import { EventRepositoryImpl } from "./event/event-repository"
import { EventServiceImpl } from "./event/event-service"
import { MarkRepositoryImpl } from "./mark/mark-repository"
import { MarkServiceImpl } from "./mark/mark-service"
import { PersonalMarkRepositoryImpl } from "./mark/personal-mark-repository"
import { PersonalMarkServiceImpl } from "./mark/personal-mark-service"
import { PaymentRepositoryImpl } from "./payment/payment-repository"
import { PaymentServiceImpl } from "./payment/payment-service"
import { ProductPaymentProviderRepositoryImpl } from "./payment/product-payment-provider-repository"
import { ProductPaymentProviderServiceImpl } from "./payment/product-payment-provider-service"
import { ProductRepositoryImpl } from "./payment/product-repository"
import { ProductServiceImpl } from "./payment/product-service"
import { RefundRequestRepositoryImpl } from "./payment/refund-request-repository"
import { RefundRequestServiceImpl } from "./payment/refund-request-service"
import { NotificationPermissionsRepositoryImpl } from "./user/notification-permissions-repository"
import { PrivacyPermissionsRepositoryImpl } from "./user/privacy-permissions-repository"
import { UserRepositoryImpl } from "./user/user-repository"
import { UserServiceImpl } from "./user/user-service"
import { EventCommitteeServiceImpl } from "./event/event-committee-service"
import { EventCommitteeRepositoryImpl } from "./event/event-committee-repository"
import { CompanyEventRepositoryImpl } from "./company/company-event-repository"
import { CompanyEventServiceImpl } from "./company/company-event-service"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export type ServerLayerOptions = {
  db: Kysely<Database>
}

export const createServiceLayer = async ({ db }: ServerLayerOptions) => {
  const eventRepository = new EventRepositoryImpl(db)
  const committeeRepository = new CommitteeRepositoryImpl(db)
  const companyRepository = new CompanyRepositoryImpl(db)
  const companyEventRepository = new CompanyEventRepositoryImpl(db)
  const eventCommitteeRepository = new EventCommitteeRepositoryImpl(db)
  const eventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const attendanceRepository = new AttendanceRepositoryImpl(db)
  const userRepository = new UserRepositoryImpl(db)
  const productRepository = new ProductRepositoryImpl(db)
  const paymentRepository = new PaymentRepositoryImpl(db)
  const productPaymentProviderRepository = new ProductPaymentProviderRepositoryImpl(db)
  const refundRequestRepository = new RefundRequestRepositoryImpl(db)
  const markRepository = new MarkRepositoryImpl(db)
  const personalMarkRepository = new PersonalMarkRepositoryImpl(db)
  const privacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository = new NotificationPermissionsRepositoryImpl(db)

  const userService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository
  )
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository)
  const attendanceService = new AttendanceServiceImpl(attendanceRepository)
  const committeeService = new CommitteeServiceImpl(committeeRepository)
  const companyService = new CompanyServiceImpl(companyRepository)
  const companyEventService = new CompanyEventServiceImpl(companyEventRepository)
  const eventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const eventCommitteeService = new EventCommitteeServiceImpl(eventCommitteeRepository)
  const productService = new ProductServiceImpl(productRepository)
  const paymentService = new PaymentServiceImpl(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository
  )
  const productPaymentProviderService = new ProductPaymentProviderServiceImpl(productPaymentProviderRepository)
  const refundRequestService = new RefundRequestServiceImpl(
    refundRequestRepository,
    paymentRepository,
    productRepository,
    paymentService
  )
  const markService = new MarkServiceImpl(markRepository)
  const personalMarkService = new PersonalMarkServiceImpl(personalMarkRepository, markService)

  return {
    userService,
    eventService,
    committeeService,
    companyService,
    attendanceService,
    companyEventService,
    eventCompanyService,
    eventCommitteeService,
    productService,
    paymentService,
    productPaymentProviderService,
    refundRequestService,
    markService,
    personalMarkService,
  }
}
