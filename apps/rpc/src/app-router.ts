import { articleRouter } from "./modules/article/article-router.ts"
import { companyRouter } from "./modules/company/company-router.ts"
import { eventRouter } from "./modules/event/event-router.ts"
import { groupRouter } from "./modules/group/group-router.ts"
import { jobListingRouter } from "./modules/job-listing/job-listing-router.ts"
import { markRouter } from "./modules/mark/mark-router.ts"
import { personalMarkRouter } from "./modules/mark/personal-mark-router.ts"
import { offlineRouter } from "./modules/offline/offline-router.ts"
import { userRouter } from "./modules/user/user-router.ts"
import { t } from "./trpc.ts"

export const appRouter = t.router({
  group: groupRouter,
  event: eventRouter,
  user: userRouter,
  company: companyRouter,
  mark: markRouter,
  personalMark: personalMarkRouter,
  jobListing: jobListingRouter,
  offline: offlineRouter,
  article: articleRouter,
})

export type AppRouter = typeof appRouter
