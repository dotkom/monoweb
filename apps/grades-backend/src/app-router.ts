import { t } from "./trpc"
import { courseRouter } from "./modules/course/course-router"

export const appRouter = t.router({
  course: courseRouter,
})

export type AppRouter = typeof appRouter
