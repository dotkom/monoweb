import { AttendServiceImpl } from "./event/attendee-service"
import { AttendanceRepositoryImpl } from "./event/attendee-repository"
import { CommitteeRepositoryImpl } from "./committee/committee-repository"
import { CommitteeServiceImpl } from "./committee/committee-service"
import { CompanyRepositoryImpl } from "./company/company-repository"
import { CompanyServiceImpl } from "./company/company-service"
import { EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { EventCompanyServiceImpl } from "./event/event-company-service"
import { EventRepositoryImpl } from "./event/event-repository"
import { EventServiceImpl } from "./event/event-service"
import { PaymentRepositoryImpl } from "./payment/payment-repository"
import { PaymentServiceImpl } from "./payment/payment-service"
import { ProductPaymentProviderRepositoryImpl } from "./payment/product-payment-provider-repository"
import { ProductPaymentProviderServiceImpl } from "./payment/product-payment-provider-service"
import { ProductRepositoryImpl } from "./payment/product-repository"
import { ProductServiceImpl } from "./payment/product-service"
import { UserRepositoryImpl } from "./auth/user-repository"
import { UserServiceImpl } from "./auth/user-service"
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

  // Services
  const userService = new UserServiceImpl(userRepository, clerkClient)
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository)
  const attendService = new AttendServiceImpl(attendanceRepository)
  const committeeService = new CommitteeServiceImpl(committeeRepository)
  const companyService = new CompanyServiceImpl(companyRepository)
  const eventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const productService = new ProductServiceImpl(productRepository)
  const paymentService = new PaymentServiceImpl(paymentRepository, productRepository, eventRepository)
  const productPaymentProviderService = new ProductPaymentProviderServiceImpl(productPaymentProviderRepository)

  return {
    userService,
    eventService,
    committeeService,
    companyService,
    attendService,
    eventCompanyService,
    productService,
    paymentService,
    productPaymentProviderService,
  }
}
