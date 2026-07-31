import { t } from "./trpc"
import { courseRouter } from "./modules/course/course-router"
import { gradeDistributionRouter } from "./modules/grade-distribution/grade-distribution-router"

export const appRouter = t.router({
  course: courseRouter,
  gradeDistribution: gradeDistributionRouter,
})

export type AppRouter = typeof appRouter
