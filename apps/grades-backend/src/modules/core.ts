import { createPrisma } from "@dotkomonline/grades-db"
import type { Configuration } from "../configuration"
import { getCourseRepository } from "./course/course-repository"
import { getCourseService } from "./course/course-service"
import { getGradeDistributionService } from "./grade-distribution/grade-distribution-service"
import { getGradeDistributionRepository } from "./grade-distribution/grade-distribution-repository"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

export function createThirdPartyClients(configuration: Configuration) {
  const prisma = createPrisma(configuration.DATABASE_URL)
  return { prisma }
}

export async function createServiceLayer(clients: ReturnType<typeof createThirdPartyClients>) {
  const courseRepository = getCourseRepository()
  const gradeDistributionRepository = getGradeDistributionRepository()
  const courseService = getCourseService(courseRepository)
  const gradeDistributionService = getGradeDistributionService(gradeDistributionRepository)

  return {
    courseService,
    gradeDistributionService,
    executeTransaction: clients.prisma.$transaction.bind(clients.prisma),
    // Do not use this directly, it is here for repl/script purposes only
    prisma: clients.prisma,
  }
}
