import { CommitteeApplicationPeriodConfigurationSchema } from "@dotkomonline/rpc/committee-application"
import { startOfDay } from "date-fns"
import { z } from "zod"

const MIN_NAME_LENGTH = 2

export const ApplicationPeriodFormSchema = CommitteeApplicationPeriodConfigurationSchema.extend({
  name: z.string(),
  applicationsOpenAt: z.date().nullable(),
  applicationsCloseAt: z.date().nullable(),
  interviewsStartDate: z.date().nullable(),
  interviewsEndDate: z.date().nullable(),
  committeeGroups: z.array(z.string()),
  nodeAndAssociatedGroups: z.array(z.string()),
})

type ApplicationPeriodForm = z.infer<typeof ApplicationPeriodFormSchema>

export const toStoredInterviewDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

export const toLocalInterviewDate = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

export const toPeriodWrite = (period: ApplicationPeriodForm) => {
  const { applicationsOpenAt, applicationsCloseAt, interviewsStartDate, interviewsEndDate } = period

  if (
    applicationsOpenAt === null ||
    applicationsCloseAt === null ||
    interviewsStartDate === null ||
    interviewsEndDate === null
  ) {
    return null
  }

  return {
    applicationPeriod: {
      name: period.name,
      isDraft: period.isDraft,
      isEnabled: period.isEnabled,
      applicationsOpenAt,
      applicationsCloseAt,
      interviewsStartDate: toStoredInterviewDate(interviewsStartDate),
      interviewsEndDate: toStoredInterviewDate(interviewsEndDate),
    },
    groups: [
      ...period.committeeGroups.map((groupId) => ({ groupId, type: "EXCLUSIVE" as const })),
      ...period.nodeAndAssociatedGroups.map((groupId) => ({ groupId, type: "ADDITIVE" as const })),
    ],
  }
}

export const validateApplicationPeriodWrite = (period: ApplicationPeriodForm): z.core.$ZodIssue[] => {
  const issues: z.core.$ZodIssue[] = []

  if (!period.name || period.name.length < MIN_NAME_LENGTH) {
    issues.push({
      code: "custom",
      message: `Navn må være minst ${MIN_NAME_LENGTH} tegn langt`,
      path: ["name"],
    })
  }

  const requiredDates = [
    { value: period.applicationsOpenAt, path: "applicationsOpenAt", label: "Søknadsstart" },
    { value: period.applicationsCloseAt, path: "applicationsCloseAt", label: "Søknadsslutt" },
    { value: period.interviewsStartDate, path: "interviewsStartDate", label: "Intervjustart" },
    { value: period.interviewsEndDate, path: "interviewsEndDate", label: "Intervjuslutt" },
  ] as const

  for (const { value, path, label } of requiredDates) {
    if (value === null) {
      issues.push({ code: "custom", message: `${label} må velges`, path: [path] })
    }
  }

  if (
    period.applicationsOpenAt !== null &&
    period.applicationsCloseAt !== null &&
    period.applicationsCloseAt <= period.applicationsOpenAt
  ) {
    issues.push({ code: "custom", message: "Søknadsslutt må være etter søknadsstart", path: ["applicationsCloseAt"] })
  }

  if (
    period.interviewsStartDate !== null &&
    period.interviewsEndDate !== null &&
    startOfDay(period.interviewsEndDate) < startOfDay(period.interviewsStartDate)
  ) {
    issues.push({
      code: "custom",
      message: "Intervjuslutt kan ikke være før intervjustart",
      path: ["interviewsEndDate"],
    })
  }

  if (
    period.applicationsCloseAt !== null &&
    period.interviewsStartDate !== null &&
    startOfDay(period.interviewsStartDate) < period.applicationsCloseAt
  ) {
    issues.push({
      code: "custom",
      message: "Intervjuene kan ikke starte før søknadsfristen",
      path: ["interviewsStartDate"],
    })
  }

  if (period.committeeGroups.length === 0 && period.nodeAndAssociatedGroups.length === 0) {
    issues.push({ code: "custom", message: "Minst én gruppe må delta i opptaket", path: ["committeeGroups"] })
  }

  return issues
}
