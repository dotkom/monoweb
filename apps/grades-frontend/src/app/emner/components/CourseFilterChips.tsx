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
type Chip = { label: string; onClick: () => void }

export const CourseFilterChips = () => {
  const t = useTranslations()
  const { control, setValue, reset, getValues } = useFormContext<CourseFilterQuery>()
  const filters = useWatch({ control })

  const chipSources = {
    bySearch: (p) =>
      p.bySearch?.trim() ? [{ label: `'${p.bySearch}'`, onClick: () => setValue("bySearch", "") }] : [],
    bySemester: (p) =>
      (p.bySemester ?? []).map((semester) => ({
        label: t(`Enums.Semester.${semester}`),
        onClick: () =>
          setValue(
            "bySemester",
            (p.bySemester ?? []).filter((s) => s !== semester)
          ),
      })),
    byTeachingLanguage: (p) =>
      (p.byTeachingLanguage ?? []).map((language) => ({
        label: t(`Enums.TeachingLanguage.${language}`),
        onClick: () =>
          setValue(
            "byTeachingLanguage",
            (p.byTeachingLanguage ?? []).filter((l) => l !== language)
          ),
      })),
    byCampus: (p) =>
      (p.byCampus ?? []).map((campus) => ({
        label: t(`Enums.Campus.${campus}`),
        onClick: () =>
          setValue(
            "byCampus",
            (p.byCampus ?? []).filter((c) => c !== campus)
          ),
      })),
    byMinGrade: (p) =>
      p.byMinGrade
        ? [
            {
              label: t(`CourseFilters.minGradeOptions.${p.byMinGrade}`),
              onClick: () => setValue("byMinGrade", null),
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
          label: t(`CourseListToolbar.sortOptions.${option.labelKey}`),
          onClick: () => {
            reset({
              ...getValues(),
              ...defaults,
            })
          },
        },
      ]
    },
  } satisfies Record<ChipFilterKey, (p: typeof filters) => Chip[]>

  const chips = (Object.keys(chipSources) as ChipFilterKey[]).flatMap((key) => chipSources[key](filters))

  if (chips.length === 0) {
    return <div className="h-7" />
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 transition duration-500 min-h-7">
      {chips.map((chip) => (
        <Chip key={chip.label} onClick={chip.onClick} label={chip.label} />
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
        "group inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      )}
    >
      <Text element="span">{label}</Text>
      {!isClearAll && <IconX className="size-3 opacity-50 group-hover:opacity-100" />}
    </Button>
  )
}
