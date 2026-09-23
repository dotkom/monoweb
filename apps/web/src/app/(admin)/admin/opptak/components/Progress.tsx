"use client"

import { tz } from "@date-fns/tz"
import {
  COMMITTEE_APPLICATION_INTERVIEW_HOURS,
  type CommitteeApplicationPeriod,
} from "@dotkomonline/rpc/committee-application"
import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconHourglassEmpty,
  IconX,
} from "@tabler/icons-react"
import { endOfDay, formatDate, isPast, parseISO } from "date-fns"
import { nb } from "date-fns/locale"
import type { ComponentType } from "react"

type Status = "done" | "ongoing" | "ready" | "upcoming" | "pending"
type Step = { label: string; status: Status; tooltip?: string }

const GREEN = "text-green-600 dark:text-green-400"
const MUTED = "text-muted-foreground"

const WaitingDots = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center justify-center gap-0.5", className)}>
    {[0, 1, 2].map((dot) => (
      <span key={dot} className="size-1 rounded-full bg-current" />
    ))}
  </span>
)

const STATUSES: Record<
  Status,
  {
    icon: ComponentType<{ className?: string }>
    color: string
    iconClass?: string
    tooltip?: string
    pointer?: string
  }
> = {
  done: { icon: IconCheck, color: GREEN, tooltip: "Ferdig" },
  ongoing: {
    icon: IconHourglassEmpty,
    color: "text-amber-600 dark:text-amber-400",
    iconClass: "motion-safe:animate-pulse",
    pointer: "Pågående",
  },
  ready: {
    icon: IconAlertTriangle,
    color: "text-destructive",
    tooltip: "Algoritmen er klar til å kjøres",
    pointer: "Klar for matching og publisering!",
  },
  upcoming: { icon: WaitingDots, color: MUTED, pointer: "Starter snart..." },
  pending: { icon: IconX, color: MUTED, iconClass: "p-1", tooltip: "Ikke på dette stadiet i prosessen enda" },
}

const periodStep = (label: string, start: Date, end: Date): Step =>
  isPast(start)
    ? { label, status: isPast(end) ? "done" : "ongoing" }
    : { label, status: "upcoming", tooltip: `Starter ${formatDate(start, "HH:mm d. MMMM", { locale: nb })}` }

export const Progress = ({ application }: { application: CommitteeApplicationPeriod }) => {
  const { startsAt, timeZone } = COMMITTEE_APPLICATION_INTERVIEW_HOURS
  const interviewsStartAt = parseISO(
    `${formatDate(application.interviewsStartDate, "yyyy-MM-dd", { in: tz("UTC") })}T${startsAt}`,
    { in: tz(timeZone) }
  )
  const interviewsEndAt = endOfDay(application.interviewsEndDate)

  const steps = (
    [
      { label: "Opptaksperiode opprettet", status: "done" },
      periodStep("Søknadsperiode", application.applicationsOpenAt, application.applicationsCloseAt),
      {
        label: "Matching & publisering",
        status: application.interviewsPublishedAt
          ? "done"
          : isPast(application.applicationsCloseAt)
            ? "ready"
            : "pending",
      },
      periodStep("Intervjuperiode", interviewsStartAt, interviewsEndAt),
      { label: "Opptaksperiode avsluttet", status: isPast(interviewsEndAt) ? "done" : "pending" },
    ] satisfies Step[]
  ).map(
    (step, index, all): Step =>
      step.status === "upcoming" && all[index - 1]?.status !== "done" ? { label: step.label, status: "pending" } : step
  )

  const currentIndex = steps.findIndex((step) => step.status !== "done")
  const reachedIndex = currentIndex === -1 ? steps.length - 1 : currentIndex

  return (
    <ol className="flex h-full flex-col items-end">
      {steps.map(({ label, status, tooltip }, index) => {
        const { icon: StatusIcon, color, iconClass, ...text } = STATUSES[status]
        const pointer = currentIndex === -1 && index === steps.length - 1 ? "Gjennomført" : text.pointer

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            {pointer && (
              <Text element="span" className={cn("flex items-center gap-1 text-xs leading-none", color)}>
                {pointer}
                <IconArrowRight className="size-3.5" stroke={2.5} />
              </Text>
            )}
            <Text element="span" className="text-sm leading-none">
              {label}
            </Text>
            <div className={cn("flex w-3 flex-col items-center self-stretch", GREEN)}>
              {index <= reachedIndex && <div className="w-0.5 flex-1 bg-current" />}
              {index === reachedIndex && (
                <>
                  <IconChevronDown className="-mt-1.5 size-3 shrink-0" stroke={3} />
                  <div className="flex-1" />
                </>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("inline-flex size-5", color, iconClass)}>
                  <StatusIcon className="size-full" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{tooltip ?? text.tooltip ?? text.pointer}</TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ol>
  )
}
