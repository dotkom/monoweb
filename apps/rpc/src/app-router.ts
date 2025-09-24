import { articleRouter } from "./modules/article/article-router"
import { auditLogRouter } from "./modules/audit-log/audit-log-router"
import { companyRouter } from "./modules/company/company-router"
import { eventRouter } from "./modules/event/event-router"
import { groupRouter } from "./modules/group/group-router"
import { jobListingRouter } from "./modules/job-listing/job-listing-router"
import { markRouter } from "./modules/mark/mark-router"
import { personalMarkRouter } from "./modules/mark/personal-mark-router"
import { offlineRouter } from "./modules/offline/offline-router"
import { userRouter } from "./modules/user/user-router"
import { workspaceRouter } from "./modules/workspace-sync/workspace-router"
import { t } from "./trpc"

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
  auditLog: auditLogRouter,
  workspace: workspaceRouter,
})

export type AppRouter = typeof appRouter
