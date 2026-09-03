"use client"

import { useTranslations } from "next-intl"

import { CourseFiltersForm } from "./CourseFiltersForm"

export function CourseFilters() {
  const t = useTranslations("CourseFilters")

  return (
    <div className="hidden md:block md:w-64 md:shrink-0">
      <section
        aria-label={t("ariaLabel")}
        className="border-neutral-200 dark:bg-stone-800 dark:border-stone-700 h-fit rounded-lg border shadow-b-sm p-6 w-full"
      >
        <CourseFiltersForm idPrefix="desktop" />
      </section>
    </div>
  )
}
