import type { SemesterKey } from "@dotkomonline/grades-backend/course"
import { useTranslations } from "next-intl"
import type { PeriodSelection } from "./course-page-params"

export type ComparePeriodLabelVariant = "default" | "compact" | "inline"

export function useFormatComparePeriodLabel() {
  const t = useTranslations("CoursePage.common")
  const periodLabel = usePeriodLabel()

  return (periodSelection: PeriodSelection, variant: ComparePeriodLabelVariant = "default") => {
    const key =
      variant === "inline" ? "compareAgainstShort" : variant === "compact" ? "compareAgainstCompact" : "compareAgainst"

    if (periodSelection.kind === "preset") {
      return t(`${key}.${periodSelection.preset}`)
    }

    return t(`${key}.semester`, { label: periodLabel(periodSelection) })
  }
}

export function usePeriodLabel(): (periodSelection: PeriodSelection) => string {
  const t = useTranslations()

  function semesterLabel(semester: SemesterKey) {
    return t("CoursePage.common.semesterLabel", {
      semester: t(`Enums.Semester.${semester.semester}`),
      year: semester.year,
    })
  }

  return (periodSelection: PeriodSelection): string => {
    if (periodSelection.kind === "preset") {
      return t(`Enums.PeriodPreset.${periodSelection.preset}`)
    }

    if (!periodSelection.semester) {
      return ""
    }

    return semesterLabel(periodSelection.semester)
  }
}
