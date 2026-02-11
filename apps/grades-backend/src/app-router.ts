import { t } from "./trpc"
import { courseRouter } from "./modules/course/course-router"
import { gradeRouter } from "./modules/grade/grade-router"

export const appRouter = t.router({
  course: courseRouter,
  grade: gradeRouter,
})

export type AppRouter = typeof appRouter
