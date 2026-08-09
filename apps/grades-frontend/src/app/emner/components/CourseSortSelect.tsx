"use client"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"
import {
  COURSE_FILTER_SORT_OPTIONS,
  findCourseFilterSortOption,
  parseCourseFilterSortValue,
  toCourseFilterSortValue,
} from "../course-filter-parsers"

const FIELD_TRIGGER_CLASS =
  "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-white focus-visible:border-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-800 dark:hover:border-stone-600 dark:focus-visible:border-stone-500"

const SELECT_ITEM_CLASS =
  "cursor-pointer p-2 hover:bg-neutral-100 data-highlighted:bg-neutral-100 dark:hover:bg-stone-700 dark:data-highlighted:bg-stone-700"

type Props = {
  id?: string
  className?: string
}

export function CourseSortSelect({ id, className }: Props) {
  const t = useTranslations()
  const { control, getValues, reset } = useFormContext<CourseFilterQuery>()

  const sortBy = useWatch({ control, name: "sortBy" })
  const orderBy = useWatch({ control, name: "orderBy" })
  const value = toCourseFilterSortValue(sortBy, orderBy)
  const selected = findCourseFilterSortOption(value)

  return (
    <Select
      id={id}
      value={value}
      onValueChange={(next) => {
        if (!next) {
          return
        }

        const parsed = parseCourseFilterSortValue(next)
        if (!parsed) {
          return
        }

        reset({
          ...getValues(),
          ...parsed,
        })
      }}
    >
      <SelectTrigger className={cn(FIELD_TRIGGER_CLASS, className)} aria-label={t("CourseFilters.sortBy")}>
        <SelectValue>{t(`CourseListToolbar.sortOptions.${selected.labelKey}`)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="dark:bg-stone-800 dark:border-stone-700">
        {COURSE_FILTER_SORT_OPTIONS.map((option) => (
          <SelectItem className={SELECT_ITEM_CLASS} key={option.value} value={option.value}>
            {t(`CourseListToolbar.sortOptions.${option.labelKey}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
