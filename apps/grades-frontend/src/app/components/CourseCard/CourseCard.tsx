"use client"

import {
  type Course,
  getCourseLocalizedTextFields,
  mapAverageGradeToLetterGrade,
} from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { Fragment } from "react"

interface Props {
  course: Course
  className?: string
}

export const CourseCard = ({ course, className }: Props) => {
  const t = useTranslations()
  const locale = useLocale()

  const isDeprecated = course.lastYearTaught !== null
  const isLetterGrade = course.gradeType === "LETTER"

  const metaItems = [
    isDeprecated && course.lastYearTaught ? t("CourseCard.lastTaught", { year: course.lastYearTaught }) : null,
    ...course.taughtSemesters.map((semester) => t(`Enums.Semester.${semester}`)),
    ...course.campuses.map((campus) => t(`Enums.Campus.${campus}`)),
    ...course.teachingLanguages.map((language) => t(`Enums.TeachingLanguage.${language}`)),
  ].filter(Boolean)

  const passRateParts = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).formatToParts(course.passRate / 100)

  return (
    <Link
      href={`/emner/${course.code}`}
      className={cn(
        "rounded-xl shadow-sm p-4 sm:p-6 grid grid-cols-[1fr_auto] gap-8 w-full border",
        "bg-white text-neutral-950 border-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
        "transition-all duration-200",
        "hover:shadow-md hover:border-neutral-400 hover:bg-neutral-50",
        "dark:hover:bg-stone-700 dark:hover:border-stone-600",
        isDeprecated && "border-dashed border-neutral-300 dark:border-stone-700",
        className
      )}
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div className="flex flex-col gap-1">
          <Title className="text-lg sm:text-xl font-normal">{getCourseLocalizedTextFields(course, locale).name}</Title>
          <Text className="font-bold text-sm sm:text-base text-neutral-500 dark:text-stone-400">{course.code}</Text>
        </div>

        {metaItems.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-x-2.5 gap-y-1 mt-auto">
            {metaItems.map((item, index) => (
              <Fragment key={item}>
                <Text className="text-sm leading-snug text-neutral-600 dark:text-stone-300">{item}</Text>
                {index < metaItems.length - 1 && (
                  <span className="size-1 shrink-0 rounded-full bg-neutral-400 dark:bg-stone-500" aria-hidden />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 w-full">
        <div className="min-h-4 flex items-center">
          <Text className="text-neutral-500 dark:text-stone-400 font-medium text-xs h-7 flex items-end">
            {isLetterGrade ? t("CourseCard.passRate", { rate: Math.round(course.passRate) }) : t("CourseCard.passFail")}
          </Text>
        </div>

        <Text className="text-4xl sm:text-5xl font-bold leading-none tracking-tight tabular-nums text-neutral-950 dark:text-stone-50">
          {isLetterGrade
            ? mapAverageGradeToLetterGrade(course.averageGrade)
            : passRateParts.map((part) =>
                part.type === "percentSign" || part.type === "literal" ? (
                  <span
                    key={part.type + part.value}
                    className="text-2xl sm:text-3xl font-medium text-neutral-400 dark:text-stone-500"
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
