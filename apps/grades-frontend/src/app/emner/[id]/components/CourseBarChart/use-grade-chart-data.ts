import {
  getChartCountFields,
  sumGradeCountFields,
  type GradeDistributionCountFields,
} from "@dotkomonline/grades-backend/grade-distribution"
import { useMemo, useState } from "react"
import { chartFieldLabel, type AggregatedGradeDistribution } from "../../utils"

const Y_MAX_HEADROOM = 1.1

export type ChartRow = {
  field: keyof GradeDistributionCountFields
  label: string
  value: number
  count: number
  ghostValue: number
  ghostCount: number
  plotValue: number
}

type TranslateFn = (key: "percent" | "grades.PASS" | "grades.FAIL", values?: { value: number }) => string

type Options = {
  primary: AggregatedGradeDistribution
  comparison: AggregatedGradeDistribution | null
  ghostEnabled: boolean
  t: TranslateFn
}

function toPercent(count: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return (count / total) * 100
}

function chartRowLabel(field: keyof GradeDistributionCountFields, t: TranslateFn) {
  const label = chartFieldLabel(field)

  if (label === "PASS" || label === "FAIL") {
    return t(`grades.${label}`)
  }

  return label
}

export function useGradeChartData({ primary, comparison, ghostEnabled, t }: Options) {
  const [activeField, setActiveField] = useState<keyof GradeDistributionCountFields | null>(null)

  const showComparison = ghostEnabled && comparison !== null

  const formatPercent = (value: number) => t("percent", { value: Math.round(value) })

  const data = useMemo(() => {
    const fields = getChartCountFields(primary.grades)
    const primaryTotal = sumGradeCountFields(primary.grades, fields)
    const comparisonTotal = comparison ? sumGradeCountFields(comparison.grades, fields) : 0

    return fields.map((field): ChartRow => {
      const count = primary.grades[field]
      const ghostCount = comparison?.grades[field] ?? 0
      const value = toPercent(count, primaryTotal)
      const ghostValue = showComparison ? toPercent(ghostCount, comparisonTotal) : 0

      return {
        field,
        label: chartRowLabel(field, t),
        value,
        count,
        ghostValue,
        ghostCount,
        plotValue: showComparison ? Math.max(value, ghostValue) : value,
      }
    })
  }, [primary.grades, comparison, showComparison, t])

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
