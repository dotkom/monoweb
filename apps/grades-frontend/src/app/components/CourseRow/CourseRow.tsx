"use client"

import {
  type Course,
  getCourseLocalizedTextFields,
  mapAverageGradeToLetterGrade,
} from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { roundPassRate } from "@/app/lib/format-stats"

interface Props {
  course: Course
  className?: string
}

export const CourseRow = ({ course, className }: Props) => {
  const t = useTranslations()
  const locale = useLocale()

  const isLetterGrade = course.gradeType === "LETTER"
  const name = getCourseLocalizedTextFields(course, locale).name

  const passRateDisplay = roundPassRate(course.passRate)
  const passRateParts = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).formatToParts(passRateDisplay / 100)

  return (
    <Link
      href={`/emner/${course.code}`}
      className={cn(
        "flex items-center gap-3 sm:gap-4 px-3 py-3 sm:px-4 sm:py-3.5",
        "bg-white text-neutral-950",
        "dark:bg-stone-800 dark:text-stone-200",
        "hover:bg-neutral-50 dark:hover:bg-stone-700/80",
        "focus-visible:outline-none focus-visible:bg-neutral-100 dark:focus-visible:bg-stone-700",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <Text className="shrink-0 text-xs sm:w-24 sm:text-sm font-bold tabular-nums text-neutral-500 dark:text-stone-400">
          {course.code}
        </Text>

        <Title
          className="min-w-0 text-sm sm:max-w-2xl sm:text-base font-normal line-clamp-2 sm:line-clamp-1 wrap-break-word hyphens-auto"
          lang={locale}
          title={name}
        >
          {name}
        </Title>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 self-center">
        {isLetterGrade ? (
          <Text className="shrink-0 whitespace-nowrap text-xs font-medium text-neutral-500 dark:text-stone-400 sm:text-sm">
            {t("CourseCard.passRate", { rate: passRateDisplay })}
          </Text>
        ) : (
          <Text className="hidden sm:inline shrink-0 whitespace-nowrap text-xs font-medium text-neutral-500 dark:text-stone-400 sm:text-sm">
            {t("CourseCard.passFail")}
          </Text>
        )}

        <Text
          className={cn(
            "min-w-7 sm:min-w-8 text-right leading-none tracking-tight tabular-nums text-neutral-950 dark:text-stone-50",
            isLetterGrade ? "text-lg sm:text-xl font-bold" : "text-base sm:text-lg font-semibold"
          )}
        >
          {isLetterGrade
            ? mapAverageGradeToLetterGrade(course.averageGrade)
            : passRateParts.map((part) =>
                part.type === "percentSign" || part.type === "literal" ? (
                  <span
                    key={part.type + part.value}
                    className="text-xs sm:text-sm font-medium text-neutral-400 dark:text-stone-500"
                  >
                    {part.value}
                  </span>
                ) : (
                  <span key={part.type + part.value}>{part.value}</span>
                )
              )}
        </Text>
      </div>
    </Link>
  )
}
