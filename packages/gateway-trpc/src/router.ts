import { articleRouter } from "./modules/article/article-router"
import { committeeRouter } from "./modules/committee/committee-router"
import { companyRouter } from "./modules/company/company-router"
import { attendanceRouter } from "./modules/event/attendance-router"
import { eventRouter } from "./modules/event/event-router"
import { interestGroupRouter } from "./modules/interest-group/interest-group-router"
import { jobListingRouter } from "./modules/job-listing/job-listing-router"
import { markRouter } from "./modules/mark/mark-router"
import { personalMarkRouter } from "./modules/mark/personal-mark-router"
import { offlineRouter } from "./modules/offline/offline-router"
import { paymentRouter } from "./modules/payment/payment-router"
import { userRouter } from "./modules/user/user-router"
import { t } from "./trpc"

export const appRouter = t.router({
  committee: committeeRouter,
  event: eventRouter,
  attendance: attendanceRouter,
  user: userRouter,
  company: companyRouter,
  payment: paymentRouter,
  mark: markRouter,
  personalMark: personalMarkRouter,
  jobListing: jobListingRouter,
  offline: offlineRouter,
  article: articleRouter,
  interestGroup: interestGroupRouter,
})

export type AppRouter = typeof appRouter
