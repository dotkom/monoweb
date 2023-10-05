import { type Kysely } from "kysely";
import { type Database } from "@dotkomonline/db";
import { EventRepositoryImpl } from "./event/event-repository";
import { CommitteeRepositoryImpl } from "./committee/committee-repository";
import { CompanyRepositoryImpl } from "./company/company-repository";
import { EventCompanyRepositoryImpl } from "./event/event-company-repository";
import { AttendanceRepositoryImpl } from "./event/attendance-repository";
import { UserRepositoryImpl } from "./user/user-repository";
import { ProductRepositoryImpl } from "./payment/product-repository";
import { PaymentRepositoryImpl } from "./payment/payment-repository";
import { ProductPaymentProviderRepositoryImpl } from "./payment/product-payment-provider-repository";
import { RefundRequestRepositoryImpl } from "./payment/refund-request-repository";
import { MarkRepositoryImpl } from "./mark/mark-repository";
import { PersonalMarkRepositoryImpl } from "./mark/personal-mark-repository";
import { PrivacyPermissionsRepositoryImpl } from "./user/privacy-permissions-repository";
import { NotificationPermissionsRepositoryImpl } from "./user/notification-permissions-repository";
import { UserServiceImpl } from "./user/user-service";
import { EventServiceImpl } from "./event/event-service";
import { AttendanceServiceImpl } from "./event/attendance-service";
import { CommitteeServiceImpl } from "./committee/committee-service";
import { CompanyServiceImpl } from "./company/company-service";
import { EventCompanyServiceImpl } from "./event/event-company-service";
import { ProductServiceImpl } from "./payment/product-service";
import { PaymentServiceImpl } from "./payment/payment-service";
import { ProductPaymentProviderServiceImpl } from "./payment/product-payment-provider-service";
import { RefundRequestServiceImpl } from "./payment/refund-request-service";
import { MarkServiceImpl } from "./mark/mark-service";
import { PersonalMarkServiceImpl } from "./mark/personal-mark-service";

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>;

export interface ServerLayerOptions {
    db: Kysely<Database>;
}

export const createServiceLayer = async ({ db }: ServerLayerOptions) => {
    const eventRepository = new EventRepositoryImpl(db);
    const committeeRepository = new CommitteeRepositoryImpl(db);
    const companyRepository = new CompanyRepositoryImpl(db);
    const eventCompanyRepository = new EventCompanyRepositoryImpl(db);
    const attendanceRepository = new AttendanceRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const productRepository = new ProductRepositoryImpl(db);
    const paymentRepository = new PaymentRepositoryImpl(db);
    const productPaymentProviderRepository = new ProductPaymentProviderRepositoryImpl(db);
    const refundRequestRepository = new RefundRequestRepositoryImpl(db);
    const markRepository = new MarkRepositoryImpl(db);
    const personalMarkRepository = new PersonalMarkRepositoryImpl(db);
    const privacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db);
    const notificationPermissionsRepository = new NotificationPermissionsRepositoryImpl(db);

    const userService = new UserServiceImpl(
        userRepository,
        privacyPermissionsRepository,
        notificationPermissionsRepository
    );

    const eventService = new EventServiceImpl(eventRepository, attendanceRepository);
    const attendanceService = new AttendanceServiceImpl(attendanceRepository);
    const committeeService = new CommitteeServiceImpl(committeeRepository);
    const companyService = new CompanyServiceImpl(companyRepository);
    const eventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository);
    const productService = new ProductServiceImpl(productRepository);
    const paymentService = new PaymentServiceImpl(
        paymentRepository,
        productRepository,
        eventRepository,
        refundRequestRepository
    );

    const productPaymentProviderService = new ProductPaymentProviderServiceImpl(productPaymentProviderRepository);
    const refundRequestService = new RefundRequestServiceImpl(
        refundRequestRepository,
        paymentRepository,
        productRepository,
        paymentService
    );

    const markService = new MarkServiceImpl(markRepository);
    const personalMarkService = new PersonalMarkServiceImpl(personalMarkRepository, markService);

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
    };
};
