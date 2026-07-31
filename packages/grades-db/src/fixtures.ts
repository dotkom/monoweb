import { createPrisma } from "./index"
import { getCourseFixtures } from "./fixtures/course"
import { getGradeDistributionFixtures } from "./fixtures/grade"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

const courseInput = getCourseFixtures()
await db.course.createMany({ data: courseInput, skipDuplicates: true })

const gradeDistributionInput = getGradeDistributionFixtures()
await db.gradeDistribution.createMany({ data: gradeDistributionInput, skipDuplicates: true })
