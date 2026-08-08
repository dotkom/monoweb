import {
  getChartCountFields,
  letterGradeCountFieldKeys,
  passFailCountFieldKeys,
  type GradeDistributionCountFields,
} from "@dotkomonline/grades-backend/grade-distribution"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { chartFieldLabel, type AggregatedGradeDistribution } from "../../utils"

const Y_MAX_HEADROOM = 1.1

export type ChartRow = {
  field: keyof GradeDistributionCountFields
  label: string
  axisLabel: string
  value: number
  count: number
  ghostValue: number
  plotValue: number
}

type Options = {
  primary: AggregatedGradeDistribution
  comparison: AggregatedGradeDistribution | null
  ghostEnabled: boolean
  compactViewport: boolean
}

type BarChartTranslate = ReturnType<typeof useTranslations<"CoursePage.barChart">>

function toPercent(count: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return (count / total) * 100
}

function chartRowLabels(field: keyof GradeDistributionCountFields, t: BarChartTranslate, compactAxisLabels: boolean) {
  const grade = chartFieldLabel(field)

  if (grade === "PASS" || grade === "FAIL") {
    return {
      label: t(`grades.${grade}`),
      axisLabel: compactAxisLabels ? t(`grades.${grade}Short`) : t(`grades.${grade}`),
    }
  }

  return { label: grade, axisLabel: grade }
}

// When ghost compare is on, show the union of primary and comparison columns.
function getChartFieldsForView(
  primary: GradeDistributionCountFields,
  comparison: GradeDistributionCountFields | null,
  showComparison: boolean
) {
  const primaryFields = getChartCountFields(primary)
  if (!showComparison || !comparison) {
    return primaryFields
  }

  const comparisonFields = getChartCountFields(comparison)
  const orderedKeys = [...letterGradeCountFieldKeys, ...passFailCountFieldKeys]

  return orderedKeys.filter((key) => primaryFields.includes(key) || comparisonFields.includes(key))
}

function chartFieldsAreMixedLetterAndPassFail(fields: readonly (keyof GradeDistributionCountFields)[]) {
  const hasLetter = fields.some((field) => field.startsWith("grade"))
  const hasPassFail = fields.some((field) => field === "passedCount" || field === "failedCount")
  return hasLetter && hasPassFail
}

function sumChartFieldCounts(
  grades: GradeDistributionCountFields,
  fields: readonly (keyof GradeDistributionCountFields)[]
) {
  return fields.reduce((sum, field) => sum + grades[field], 0)
}

export function useGradeChartData({ primary, comparison, ghostEnabled, compactViewport }: Options) {
  const t = useTranslations("CoursePage.barChart")
  const [activeField, setActiveField] = useState<keyof GradeDistributionCountFields | null>(null)

  const showComparison = ghostEnabled && comparison !== null

  const formatPercent = (value: number) => t("percent", { value: Math.round(value) })

  const data = useMemo(() => {
    const fields = getChartFieldsForView(primary.grades, comparison?.grades ?? null, showComparison)
    const compactAxisLabels = compactViewport && chartFieldsAreMixedLetterAndPassFail(fields)
    const primaryTotal = sumChartFieldCounts(primary.grades, fields)
    const comparisonTotal = comparison ? sumChartFieldCounts(comparison.grades, fields) : 0

    return fields.map((field): ChartRow => {
      const count = primary.grades[field]
      const ghostCount = comparison ? comparison.grades[field] : 0
      const value = toPercent(count, primaryTotal)
      const ghostValue = showComparison ? toPercent(ghostCount, comparisonTotal) : 0
      const { label, axisLabel } = chartRowLabels(field, t, compactAxisLabels)

      return {
        field,
        label,
        axisLabel,
        value,
        count,
        ghostValue,
        plotValue: showComparison ? Math.max(value, ghostValue) : value,
      }
    })
  }, [primary.grades, comparison, showComparison, compactViewport, t])

  const yMax = useMemo(() => {
    const peak = data.reduce((max, row) => Math.max(max, row.plotValue), 0)
    return Math.max(peak * Y_MAX_HEADROOM, 1)
  }, [data])

  const activeRow = data.find((row) => row.field === activeField) ?? null

  return {
    data,
    yMax,
    activeRow,
    setActiveField,
    showComparison,
    formatPercent,
  }
}
