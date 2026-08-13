"use client"

import { buildCourseMetaItems } from "@/app/emner/[id]/utils"
import { roundPassRate } from "@/app/lib/format-stats"
import {
  type CourseListItem,
  getCourseLocalizedName,
  mapAverageGradeToLetterGrade,
} from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import Link from "next/link"

interface Props {
  course: CourseListItem
  className?: string
}

export const CourseCard = ({ course, className }: Props) => {
  const t = useTranslations()
  const locale = useLocale()
  const format = useFormatter()

  const isDeprecated = course.lastYearTaught !== null
  const isLetterGrade = course.gradeType === "LETTER"

  const metaItems = buildCourseMetaItems(course, t, format)

  const passRateDisplay = roundPassRate(course.passRate)
  const passRateParts = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).formatToParts(passRateDisplay / 100)

  return (
    <Link
      href={`/emner/${course.code}`}
      className={cn(
        "rounded-xl shadow-sm p-4 sm:p-6 grid grid-cols-[1fr_auto] gap-4 sm:gap-8 w-full border",
        "bg-white text-neutral-950 border-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
        "motion-safe:transition-all motion-safe:duration-200",
        "hover:shadow-md hover:border-neutral-400 hover:bg-neutral-50",
        "dark:hover:bg-stone-700 dark:hover:border-stone-600",
        isDeprecated && "border-dashed border-neutral-300 dark:border-stone-700",
        className
      )}
    >
      <div className="flex flex-col gap-6 h-full min-h-0 min-w-0">
        <div className="flex flex-col gap-1">
          <Title
            element="h2"
            className="text-lg sm:text-xl font-normal line-clamp-2 wrap-break-word hyphens-auto"
            lang={locale}
          >
            {getCourseLocalizedName(course, locale)}
          </Title>
          <Text className="font-bold text-sm sm:text-base text-neutral-500 dark:text-stone-400">{course.code}</Text>
        </div>

        <div className="flex max-h-5 flex-wrap items-center gap-x-2.5 overflow-hidden">
          {metaItems.map((item, index) => (
            <div key={item} className="flex shrink-0 items-center gap-x-2.5 whitespace-nowrap">
              {index > 0 && <span className="size-1 rounded-full bg-neutral-400 dark:bg-stone-500" aria-hidden />}
              <Text className="text-sm text-neutral-600 dark:text-stone-300">{item}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="min-h-4 flex items-center">
          <Text className="text-neutral-500 dark:text-stone-400 font-medium text-xs h-7 flex items-end">
            {isLetterGrade ? t("CourseCard.passRate", { rate: passRateDisplay }) : t("CourseCard.passFail")}
          </Text>
        </div>

        <Text className="text-5xl font-bold leading-none tracking-tight tabular-nums text-neutral-950 dark:text-stone-50">
          {isLetterGrade
            ? mapAverageGradeToLetterGrade(course.averageGrade)
            : passRateParts.map((part) =>
                part.type === "percentSign" || part.type === "literal" ? (
                  <span
                    key={part.type + part.value}
                    className="text-3xl font-medium text-neutral-400 dark:text-stone-500"
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
