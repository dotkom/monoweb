"use client"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Button, cn, Text } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"
import {
  DEFAULT_COURSE_FILTER_SORT,
  EMPTY_COURSE_FILTER_QUERY,
  findCourseFilterSortOption,
  parseCourseFilterSortValue,
  toCourseFilterSortValue,
} from "../course-filter-parsers"

type ChipFilterKey = Exclude<keyof CourseFilterQuery, "orderBy">
type Chip = { key: string; label: string; onClear: () => void }
type Filters = Partial<CourseFilterQuery>

function removeChips<T extends string>(
  values: T[] | undefined,
  field: string,
  labelOf: (value: T) => string,
  clear: (next: T[]) => void
): Chip[] {
  const list = values ?? []

  return list.map((value) => ({
    key: `${field}-${value}`,
    label: labelOf(value),
    onClear: () => clear(list.filter((v) => v !== value)),
  }))
}

export const CourseFilterChips = () => {
  const t = useTranslations()
  const { control, setValue, reset, getValues } = useFormContext<CourseFilterQuery>()
  const filters = useWatch({ control })

  const chipSources = {
    bySearch: (p) =>
      p.bySearch?.trim()
        ? [{ key: "bySearch", label: `'${p.bySearch}'`, onClear: () => setValue("bySearch", "") }]
        : [],
    bySemester: (p) =>
      removeChips(
        p.bySemester,
        "bySemester",
        (semester) => t(`Enums.Semester.${semester}`),
        (next) => setValue("bySemester", next)
      ),
    byTeachingLanguage: (p) =>
      removeChips(
        p.byTeachingLanguage,
        "byTeachingLanguage",
        (language) => t(`Enums.TeachingLanguage.${language}`),
        (next) => setValue("byTeachingLanguage", next)
      ),
    byCampus: (p) =>
      removeChips(
        p.byCampus,
        "byCampus",
        (campus) => t(`Enums.Campus.${campus}`),
        (next) => setValue("byCampus", next)
      ),
    byMinGrade: (p) =>
      p.byMinGrade
        ? [
            {
              key: "byMinGrade",
              label: t(`CourseFilters.minGradeOptions.${p.byMinGrade}`),
              onClear: () => setValue("byMinGrade", null),
            },
          ]
        : [],
    sortBy: (p) => {
      const value = toCourseFilterSortValue(p.sortBy, p.orderBy)
      if (value === DEFAULT_COURSE_FILTER_SORT) {
        return []
      }

      const option = findCourseFilterSortOption(value)
      const defaults = parseCourseFilterSortValue(DEFAULT_COURSE_FILTER_SORT)
      if (!defaults) {
        return []
      }

      return [
        {
          key: "sortBy",
          label: t(`CourseListToolbar.sortOptions.${option.labelKey}`),
          onClear: () => reset({ ...getValues(), ...defaults }),
        },
      ]
    },
  } satisfies Record<ChipFilterKey, (p: Filters) => Chip[]>

  const chips = (Object.keys(chipSources) as ChipFilterKey[]).flatMap((key) => chipSources[key](filters))

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 transition duration-500">
      {chips.map((chip) => (
        <Chip key={chip.key} onClick={chip.onClear} label={chip.label} />
      ))}

      <Separator
        orientation="vertical"
        className="mx-1 h-4 self-center! bg-neutral-300 dark:bg-stone-600"
        aria-hidden
      />

      <Chip onClick={() => reset(EMPTY_COURSE_FILTER_QUERY)} label={t("CourseFilters.clearAll")} isClearAll />
    </div>
  )
}

interface ChipProps {
  onClick: () => void
  label: string
  isClearAll?: boolean
}

const Chip = ({ onClick, label, isClearAll }: ChipProps) => {
  return (
    <Button
      variant="unstyled"
      onClick={onClick}
      className={cn(
        "group inline-flex max-w-full min-w-0 items-center gap-1 rounded-md px-2 py-1 text-xs",
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700",
        "h-auto shrink whitespace-normal wrap-break-word text-left"
      )}
    >
      <Text element="span" className="min-w-0 wrap-break-word">
        {label}
      </Text>
      {!isClearAll && <IconX className="size-3 shrink-0 opacity-50 group-hover:opacity-100" />}
    </Button>
  )
}
