import type { SemesterKey } from "@dotkomonline/grades-backend/course"
import { useTranslations } from "next-intl"
import type { PeriodSelection } from "./course-page-params"

export function useFormatComparePeriodLabel() {
  const t = useTranslations("CoursePage.common")
  const periodLabel = usePeriodLabel()

  return (periodSelection: PeriodSelection, short: boolean = false) => {
    if (periodSelection.kind === "preset") {
      return t(`compareAgainst${short ? "Short" : ""}.${periodSelection.preset}`)
    }

    return t(`compareAgainst${short ? "Short" : ""}.semester`, { label: periodLabel(periodSelection) })
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
