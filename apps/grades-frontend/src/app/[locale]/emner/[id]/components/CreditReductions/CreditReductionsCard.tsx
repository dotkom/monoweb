import type { Course, CreditReductionDetail } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { getFormatter, getTranslations } from "next-intl/server"
import { CreditReductionsList } from "./CreditReductionsList"

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

  const format = await getFormatter()
  const t = await getTranslations("CoursePage.CourseAbout.CreditReductions")

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

      <CreditReductionsList creditReductions={creditReductions} />
    </aside>
  )
}
