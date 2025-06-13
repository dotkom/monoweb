export * from "./error"
export * from "./modules/core"
export * from "./query"

export * from "./modules/article/article-error"
export * from "./modules/company/company-error"
export * from "./modules/attendance/attendance-pool-error"
export * from "./modules/attendance/attendance-error"
export * from "./modules/attendance/attendee-error"
export * from "./modules/event/event-error"
export * from "./modules/group/group-error"
export * from "./modules/job-listing/job-listing-error"
export * from "./modules/mark/mark-error"
export * from "./modules/mark/personal-mark-error"
export * from "./modules/offline/offline-error"
export * from "./modules/payment/payment-error"
export * from "./modules/payment/product-error"
export * from "./modules/payment/refund-request-error"

// TODO: This is a leak in the separation of concerns. This is currently just so the next-auth callbacks can create a
//       user without requiring the entire app to depend on all of the core dependencies. Ideally, the next-auth code
//       should not be responsible for creating a user, but instead be done through an Auth0 event trigger.
export { UserRepositoryImpl, type UserRepository } from "./modules/user/user-repository"
export { UserServiceImpl, type UserService } from "./modules/user/user-service"
