"use client"

import { parseSemesterKey, serializeSemesterKey, type SemesterKey } from "@dotkomonline/grades-backend/course"
import {
  sortGradeDistributionsByYearAndSemester,
  type GradeDistribution,
} from "@dotkomonline/grades-backend/grade-distribution"
import { Button, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { IconChevronDown } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef } from "react"
import type { PeriodPreset } from "../course-page-params"
import { useCoursePeriodView } from "../useCoursePeriodView"
import { usePeriodLabel } from "../usePeriodLabel"

const tabClassName = (selected: boolean) =>
  cn(
    "h-auto px-3 py-2 font-medium text-sm flex-shrink-0",
    "dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600 dark:hover:bg-stone-700 hover:bg-muted/60",
    selected &&
      "border-transparent bg-primary text-primary-foreground hover:border-transparent hover:bg-primary/90 hover:text-primary-foreground dark:border-transparent dark:bg-primary dark:hover:bg-primary/90"
  )

type Props = {
  gradeDistributions: GradeDistribution[]
}

export const SemesterTabs = ({ gradeDistributions }: Props) => {
  const { setPeriod, periodSelection } = useCoursePeriodView(gradeDistributions)
  const t = useTranslations()
  const periodLabel = usePeriodLabel()

  const selectedTabRef = useRef<HTMLButtonElement>(null)

  // Scroll to selected tab on mount on mobile
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) {
      return
    }

    selectedTabRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    })
  }, [])

  const refIfSelected = (selected: boolean) => (selected ? selectedTabRef : undefined)

  const semestersNewestFirst = useMemo(
    () =>
      sortGradeDistributionsByYearAndSemester(gradeDistributions).map((gd) => ({
        year: gd.year,
        semester: gd.semester,
      })),
    [gradeDistributions]
  )

  const recentSemesters = semestersNewestFirst.slice(0, 3)
  const olderSemesters = semestersNewestFirst.slice(3)

  const latestYear = semestersNewestFirst.at(0)?.year ?? 0
  const threeYearsCutoff = latestYear - 2
  const showLastThreeYears = semestersNewestFirst.some((semester) => semester.year < threeYearsCutoff)
  const showAllYears = semestersNewestFirst.length > 1

  const presets: PeriodPreset[] = []

  if (showLastThreeYears) {
    presets.push("LAST_THREE_YEARS")
  }

  if (showAllYears) {
    presets.push("ALL_YEARS")
  }

  const selectSemester = (semester: SemesterKey) => {
    setPeriod({
      kind: "semester",
      semester,
    })
  }

  const selectPreset = (preset: PeriodPreset) => {
    setPeriod({
      kind: "preset",
      preset,
    })
  }

  const isSemesterSelected = (semester: SemesterKey) => {
    if (periodSelection.kind === "preset" || periodSelection.semester === null) {
      return false
    }

    return periodSelection.semester.year === semester.year && periodSelection.semester.semester === semester.semester
  }

  const olderSelection = olderSemesters.find((semester) => isSemesterSelected(semester)) ?? null

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-1", "scrollbar-none [&::-webkit-scrollbar]:hidden")}>
      {recentSemesters.map((semester) => (
        <Button
          key={serializeSemesterKey(semester)}
          ref={refIfSelected(isSemesterSelected(semester))}
          variant="outline"
          size="xl"
          className={tabClassName(isSemesterSelected(semester))}
          onClick={() => selectSemester(semester)}
        >
          {periodLabel({ kind: "semester", semester })}
        </Button>
      ))}

      {olderSemesters.length > 0 && (
        <Select
          value={olderSelection ? serializeSemesterKey(olderSelection) : null}
          onValueChange={(value: string | null) => {
            if (value == null) {
              return
            }

            const semester = parseSemesterKey(value)
            if (semester) {
              selectSemester(semester)
            }
          }}
        >
          <SelectTrigger
            ref={refIfSelected(olderSelection !== null)}
            icon={
              <IconChevronDown className="pointer-events-none size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out" />
            }
            className={cn(
              "w-40 data-placeholder:text-foreground data-popup-open:[&_svg]:rotate-180",
              "dark:bg-stone-800 dark:border-stone-700",
              tabClassName(olderSelection !== null)
            )}
          >
            <SelectValue>
              {olderSelection
                ? periodLabel({ kind: "semester", semester: olderSelection })
                : t("CoursePage.semesterTabs.olderSemesters")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60 w-(--anchor-width) min-w-(--anchor-width) max-w-(--anchor-width) dark:bg-stone-800 dark:border-stone-700">
            {olderSemesters.map((semester) => (
              <SelectItem
                key={serializeSemesterKey(semester)}
                value={serializeSemesterKey(semester)}
                className="cursor-pointer p-2 hover:bg-neutral-100 dark:hover:bg-stone-700 data-highlighted:bg-neutral-100 dark:data-highlighted:bg-stone-700"
              >
                {periodLabel({ kind: "semester", semester })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {presets.length > 0 && (
        <>
          <Separator orientation="vertical" />

          {presets.map((preset) => {
            const isSelected = periodSelection.kind === "preset" && periodSelection.preset === preset

            return (
              <Button
                key={preset}
                variant="outline"
                size="xl"
                className={tabClassName(isSelected)}
                onClick={() => selectPreset(preset)}
                ref={refIfSelected(isSelected)}
              >
                {t(`Enums.PeriodPreset.${preset}`)}
              </Button>
            )
          })}
        </>
      )}
    </div>
  )
}
