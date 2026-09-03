"use client"

import { parseSemesterKey, serializeSemesterKey, type GradeType } from "@dotkomonline/grades-backend/course"
import {
  calculateCourseStatistics,
  getGradeDistributionCandidateCount,
  getLetterGradeCandidateCount,
  sortGradeDistributionsByYearAndSemester,
  type GradeDistribution,
} from "@dotkomonline/grades-backend/grade-distribution"
import { cn } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useCoursePeriodView } from "../../useCoursePeriodView"
import { CourseSectionCard } from "../CourseSectionCard"
import { CourseLineChart, type CourseLineChartMode, type CourseLineChartPoint } from "./CourseLineChart"

type Props = {
  gradeDistributions: GradeDistribution[]
  mode: CourseLineChartMode
  className?: string
}

export function CourseLineChartCard({ gradeDistributions, mode, className }: Props) {
  const t = useTranslations()
  const tSemesterShort = useTranslations("Enums.SemesterShort")
  const { selectedRows, setPeriod } = useCoursePeriodView(gradeDistributions)

  const points = useMemo(
    () => toLineChartPoints(gradeDistributions, mode, tSemesterShort),
    [gradeDistributions, mode, tSemesterShort]
  )

  const selectedIds = useMemo(
    () => selectedRows.map((row) => serializeSemesterKey({ year: row.year, semester: row.semester })),
    [selectedRows]
  )

  return (
    <CourseSectionCard
      title={mode === "LETTER" ? t("CoursePage.lineChart.averageOverTime") : t("CoursePage.lineChart.passRateOverTime")}
      className={cn("overflow-visible", className)}
    >
      <CourseLineChart
        mode={mode}
        points={points}
        selectedIds={selectedIds}
        onPointClick={(pointId) => {
          const semester = parseSemesterKey(pointId)
          if (!semester) {
            return
          }

          setPeriod({ kind: "semester", semester })
        }}
      />
    </CourseSectionCard>
  )
}

function toLineChartPoints(
  gradeDistributions: GradeDistribution[],
  mode: GradeType,
  t: ReturnType<typeof useTranslations<"Enums.SemesterShort">>
): CourseLineChartPoint[] {
  const oldestFirst = sortGradeDistributionsByYearAndSemester(gradeDistributions).toReversed()

  return oldestFirst.flatMap((gradeDistribution) => {
    const semester = { year: gradeDistribution.year, semester: gradeDistribution.semester }
    const stats = calculateCourseStatistics([gradeDistribution])
    const label = `${t(semester.semester)}${String(semester.year).slice(-2)}`

    if (mode === "LETTER") {
      const letterCount = getLetterGradeCandidateCount(gradeDistribution)

      // Show pass/fail semesters as empty dots on the x-axis
      return [
        {
          id: serializeSemesterKey(semester),
          label,
          value: letterCount > 0 ? stats.averageGrade : null,
        },
      ]
    }

    if (getGradeDistributionCandidateCount(gradeDistribution) === 0) {
      return []
    }

    return [
      {
        id: serializeSemesterKey(semester),
        label,
        value: stats.passRate,
      },
    ]
  })
}
