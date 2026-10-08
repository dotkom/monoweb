import { useMemo } from "react"
import { type ApplicationPeriod, testApplicationPeriods } from "./opptak"

export const useApplicationPeriodFindManyQuery = () => {
  const applicationPeriods = useMemo<ApplicationPeriod[]>(() => testApplicationPeriods, [])

  return { applicationPeriods, isLoading: false }
}

export const useApplicationPeriodGetQuery = (applicationPeriodId: string) => {
  const applicationPeriod = useMemo(
    () => testApplicationPeriods.find((period) => period.id === applicationPeriodId) ?? null,
    [applicationPeriodId]
  )

  return { applicationPeriod, isLoading: false }
}
