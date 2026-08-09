"use client"

import { Text } from "@dotkomonline/ui"
import { IconChartBarOff } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

export const CourseNoGradesState = () => {
  const t = useTranslations("CoursePage.noGrades")

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg px-6 text-center" role="status">
      <div className="flex size-11 items-center justify-center rounded-full bg-neutral-200 dark:bg-stone-700">
        <IconChartBarOff className="size-5 text-neutral-400 dark:text-stone-400" stroke={1.75} aria-hidden />
      </div>

      <div className="flex max-w-sm flex-col gap-1">
        <Text className="text-base font-medium text-neutral-800 dark:text-stone-100">{t("title")}</Text>
        <Text className="text-sm text-neutral-500 dark:text-stone-400">{t("hint")}</Text>
      </div>
    </div>
  )
}
