import {
  calculateCourseGradeType,
  calculateCourseStatistics,
  getLastThreeYearsGradeDistributions,
} from "src/modules/grade-distribution/grade-distribution-types"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies)
const prisma = serviceLayer.prisma

const courses = await prisma.course.findMany({
  include: {
    gradeDistributions: true,
  },
})

for (const course of courses) {
  const courseStatisticsAllYears = calculateCourseStatistics(course.gradeDistributions)
  const courseStatisticsLastThreeYears = calculateCourseStatistics(
    getLastThreeYearsGradeDistributions(course.gradeDistributions)
  )

  const gradeType = calculateCourseGradeType(course.gradeDistributions)

  await prisma.course.update({
    where: { id: course.id },
    data: {
      candidateCount: courseStatisticsAllYears.candidateCount,
      averageGradeLastThreeYears: courseStatisticsLastThreeYears.averageGrade,
      passRateLastThreeYears: courseStatisticsLastThreeYears.passRate,
      gradeType,
    },
  })
}
