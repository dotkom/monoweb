import { AttendanceRepositoryImpl } from "./event/attendance-repository"
import { AttendanceServiceImpl } from "./event/attendance-service"
import { CommitteeRepositoryImpl } from "./committee/committee-repository"
import { CommitteeServiceImpl } from "./committee/committee-service"
import { CompanyRepositoryImpl } from "./company/company-repository"
import { CompanyServiceImpl } from "./company/company-service"
import { EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { EventCompanyServiceImpl } from "./event/event-company-service"
import { EventRepositoryImpl } from "./event/event-repository"
import { EventServiceImpl } from "./event/event-service"
import { MarkRepositoryImpl } from "./marks/mark-repository"
import { MarkServiceImpl } from "./marks/mark-service"
import { PaymentRepositoryImpl } from "./payment/payment-repository"
import { PaymentServiceImpl } from "./payment/payment-service"
import { PersonalMarkRepositoryImpl } from "./marks/personal-mark-repository"
import { PersonalMarkServiceImpl } from "./marks/personal-mark-service"
import { PrivacyPermissionsRepositoryImpl } from "./user/privacy-permissions-repository"
import { ProductPaymentProviderRepositoryImpl } from "./payment/product-payment-provider-repository"
import { ProductPaymentProviderServiceImpl } from "./payment/product-payment-provider-service"
import { ProductRepositoryImpl } from "./payment/product-repository"
import { ProductServiceImpl } from "./payment/product-service"
import { RefundRequestRepositoryImpl } from "./payment/refund-request-repository"
import { RefundRequestServiceImpl } from "./payment/refund-request-service"
import { UserRepositoryImpl } from "./user/user-repository"
import { UserServiceImpl } from "./user/user-service"
import { clerkClient } from "@clerk/nextjs/server"
import { kysely } from "@dotkomonline/db"

export const initServices = () => {
  const db = kysely
  const eventRepository = new EventRepositoryImpl(db)
  const committeeRepository = new CommitteeRepositoryImpl(db)
  const companyRepository = new CompanyRepositoryImpl(db)
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

  // Services
  const userService = new UserServiceImpl(userRepository, privacyPermissionsRepository, clerkClient)
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository)
  const attendanceService = new AttendanceServiceImpl(attendanceRepository)
  const committeeService = new CommitteeServiceImpl(committeeRepository)
  const companyService = new CompanyServiceImpl(companyRepository)
  const eventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
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
    eventCompanyService,
    productService,
    paymentService,
    productPaymentProviderService,
    refundRequestService,
    markService,
    personalMarkService,
  }
}
