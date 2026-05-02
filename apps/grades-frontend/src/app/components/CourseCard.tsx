import { type Course, getCourseName, mapAverageGradeToLetterGrade } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import type { PropsWithChildren } from "react"

interface Props {
  course: Course
}

export const CourseCard = async ({ course }: Props) => {
  const t = await getTranslations()
  const locale = await getLocale()

  const isDeprecated = course.lastYearTaught !== null
  const isLetterGrade = course.gradeType === "LETTER"

  return (
    <Link
      href={`/emner/${course.code}`}
      className={cn(
        "rounded-xl shadow-sm p-4 sm:p-6 grid grid-cols-[1fr_auto] gap-8 w-full border",
        "bg-white text-neutral-950 border-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-400 hover:bg-neutral-50",
        "dark:hover:bg-stone-700 dark:hover:border-stone-600",
        isDeprecated && "border-dashed border-neutral-300 dark:border-stone-700"
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Title className="text-lg sm:text-xl font-normal">{getCourseName(course, locale)}</Title>
          <Text className="font-bold text-sm sm:text-base text-neutral-500 dark:text-stone-400">{course.code}</Text>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {isDeprecated && course.lastYearTaught && (
            <CourseBadge className="text-neutral-500 border-dashed border-neutral-300 dark:text-stone-400 dark:border-stone-700">
              {t("CourseCard.lastTaught", { year: course.lastYearTaught })}
            </CourseBadge>
          )}

          {course.taughtSemesters.map((semester) => (
            <CourseBadge key={semester}>{t(`Enums.Semester.${semester}`)}</CourseBadge>
          ))}

          {course.campuses.map((campus) => (
            <CourseBadge key={campus} className="hidden sm:inline-flex">
              {t(`Enums.Campus.${campus}`)}
            </CourseBadge>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full">
        <div className="min-h-4 flex items-center">
          <Text className="text-neutral-500 dark:text-stone-400 font-medium text-xs h-7 flex items-end">
            {isLetterGrade ? t("CourseCard.passRate", { rate: Math.round(course.passRate) }) : t("CourseCard.passFail")}
          </Text>
        </div>

        <Text
          className={cn("font-bold tracking-normal", isLetterGrade ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl")}
        >
          {isLetterGrade ? `${mapAverageGradeToLetterGrade(course.averageGrade)}` : `${Math.round(course.passRate)}%`}
        </Text>
      </div>
    </Link>
  )
}

const CourseBadge = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium leading-none",
      "bg-neutral-100 text-neutral-700 border-neutral-200",
      "dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
      className
    )}
  >
    {children}
  </span>
)
