"use client"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Button, Text } from "@dotkomonline/ui"
import { IconSearchOff } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { EMPTY_COURSE_FILTER_QUERY } from "../course-filter-parsers"

export const CourseListEmptyState = () => {
  const t = useTranslations()
  const { reset } = useFormContext<CourseFilterQuery>()

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg px-6 py-10 text-center" role="status">
      <div className="flex size-11 items-center justify-center rounded-full bg-neutral-200 dark:bg-stone-700">
        <IconSearchOff className="size-5 text-neutral-400 dark:text-stone-400" stroke={1.75} aria-hidden />
      </div>

      <div className="flex max-w-xs flex-col gap-1">
        <Text className="text-base font-medium text-neutral-800 dark:text-stone-100">
          {t("CourseList.empty.title")}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-stone-400">{t("CourseList.empty.hint")}</Text>
      </div>

      <Button variant="outline" size="sm" onClick={() => reset(EMPTY_COURSE_FILTER_QUERY)}>
        {t("CourseList.empty.clearFilters")}
      </Button>
    </div>
  )
}
