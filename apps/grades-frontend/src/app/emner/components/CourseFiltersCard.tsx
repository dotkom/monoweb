"use client"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { useTranslations } from "next-intl"

import { CourseFiltersForm } from "./CourseFiltersForm"

type Props = {
  defaultValues: CourseFilterQuery
}

export function CourseFiltersCard({ defaultValues }: Props) {
  const t = useTranslations("CourseFilters")

  return (
    <section
      aria-label={t("ariaLabel")}
      className="border-gray-200 dark:bg-stone-800 dark:border-stone-700 h-fit rounded-lg border shadow-b-sm p-6 w-full"
    >
      <CourseFiltersForm defaultValues={defaultValues} />
    </section>
  )
}
