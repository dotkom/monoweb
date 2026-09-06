import { Link } from "@/i18n/navigation"
import { pickLocalized, type Course, type CreditReductionDetail } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"

const TITLE_ID = "credit-reductions-title"

interface Props {
  creditReductions: CreditReductionDetail[]
  course: Course
  className?: string
}

export const CreditReductionsCard = async ({ creditReductions, course, className }: Props) => {
  if (creditReductions.length === 0) {
    return null
  }

  const locale = await getLocale()
  const format = await getFormatter()
  const t = await getTranslations("CoursePage.CourseAbout.CreditReductions")
  const tCommon = await getTranslations("Common")

  return (
    <aside
      aria-labelledby={TITLE_ID}
      className={cn(
        "flex h-fit flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-stone-700 dark:bg-stone-800",
        className
      )}
    >
      <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-stone-700 p-4 sm:p-6 pb-2!">
        <Title id={TITLE_ID} element="h3" className="text-sm font-medium text-neutral-600 dark:text-stone-300">
          {t("title")}
        </Title>
        <Text className="text-[13px] text-neutral-500 dark:text-stone-400 text-pretty">
          {course.credits !== null
            ? t("description", {
                code: course.code,
                credits: format.number(course.credits, { maximumFractionDigits: 1 }),
              })
            : t("descriptionWithoutCredits", { code: course.code })}
        </Text>
      </div>

      <ul className="flex flex-col p-3 sm:p-5 pt-0!">
        {creditReductions.map(({ overlapCourseId, overlapCourse, reductionAmount }) => (
          <li key={overlapCourseId}>
            <Link
              href={`/emner/${encodeURIComponent(overlapCourse.code)}`}
              className="flex items-baseline gap-4 rounded-md -mx-1 px-2 py-3 hover:bg-neutral-200/70 dark:hover:bg-stone-700/60 focus-visible:outline-none focus-visible:bg-neutral-200/60 dark:focus-visible:bg-stone-700"
            >
              <div className="min-w-0 flex-1">
                <Text element="span" className="block text-[13px] text-neutral-500 dark:text-stone-400 tabular-nums">
                  {overlapCourse.code}
                </Text>
                <Text element="span" className="block text-[13px] text-neutral-900 dark:text-stone-200" lang={locale}>
                  {pickLocalized(locale, overlapCourse.nameNo, overlapCourse.nameEn) ?? overlapCourse.nameNo}
                </Text>
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <Text element="span" className="text-[13px] text-neutral-900 dark:text-stone-200 tabular-nums">
                  {tCommon.rich("credits", {
                    credits: format.number(-reductionAmount, { maximumFractionDigits: 1 }),
                    unit: (chunks) => (
                      <span className="font-normal text-xs text-neutral-500 dark:text-stone-400">{chunks}</span>
                    ),
                  })}
                </Text>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
