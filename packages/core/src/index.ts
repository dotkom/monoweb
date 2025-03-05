export * from "./error"
export * from "./query"
export * from "./modules/core"

export * from "./modules/article/article-error"
export * from "./modules/committee/committee-error"
export * from "./modules/company/company-error"
export * from "./modules/event/attendee-error"
export * from "./modules/event/event-error"
export * from "./modules/job-listing/job-listing-error"
export * from "./modules/offline/offline-error"
export * from "./modules/mark/mark-error"
export * from "./modules/mark/personal-mark-error"
export * from "./modules/payment/payment-error"
export * from "./modules/payment/refund-request-error"
export * from "./modules/payment/product-error"

// TODO: This is a leak in the separation of concerns. This is currently just so the next-auth callbacks can create a
//       user without requiring the entire app to depend on all of the core dependencies. Ideally, the next-auth code
//       should not be responsible for creating a user, but instead be done through an Auth0 event trigger.
export { type UserRepository, UserRepositoryImpl } from "./modules/user/user-repository"
export { type UserService, UserServiceImpl } from "./modules/user/user-service"
