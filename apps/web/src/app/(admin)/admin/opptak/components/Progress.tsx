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
  IconCircleDashed,
  IconHourglassEmpty,
} from "@tabler/icons-react"
import { endOfDay, formatDate, isPast, parseISO } from "date-fns"
import { nb } from "date-fns/locale"
import type { ComponentType } from "react"
import { useApplicationPeriodGroupsQuery } from "../queries"

type Status = "done" | "ongoing" | "ready" | "upcoming" | "pending"
type Step = { label: string; status: Status; tooltip?: string }

const GREEN = "text-green-600 dark:text-green-400"
const MUTED = "text-muted-foreground"

const SpinningClock = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12V7" className="origin-center motion-safe:animate-spin motion-safe:[animation-duration:6s]" />
    <path d="M12 12l3 3" className="origin-center motion-safe:animate-spin motion-safe:[animation-duration:72s]" />
  </svg>
)

const PingingAlert = ({ className }: { className?: string }) => (
  <span className={cn("relative inline-flex", className)}>
    <IconAlertTriangle className="absolute inset-0 m-auto size-3/5 opacity-60 motion-safe:animate-ping motion-safe:[animation-duration:2s]" />
    <IconAlertTriangle className="relative size-full" />
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
    iconClass:
      "motion-safe:animate-spin motion-safe:[animation-duration:3s] motion-safe:[animation-timing-function:linear(0,0_75%,0.03_78%,0.15_82%,0.5_87.5%,0.85_93%,0.97_97%,1)]",
    pointer: "Pågående",
  },
  ready: {
    icon: PingingAlert,
    color: "text-destructive",
    tooltip: "Klar til å kjøres, krever manuell utføring!",
    pointer: "Handlingen må utføres manuelt",
  },
  upcoming: {
    icon: SpinningClock,
    color: "text-green-500 dark:text-green-300",
    iconClass: "p-0.5",
    pointer: "Åpner snart",
  },
  pending: {
    icon: IconCircleDashed,
    color: MUTED,
    iconClass: "p-0.5",
    tooltip: "Ikke på dette stadiet i prosessen enda",
  },
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
  const { applicationGroups } = useApplicationPeriodGroupsQuery(application.id)
  const availableCount = applicationGroups.filter(
    (group) => group.interviewBlockCount > 0 && group.hasAllValidRooms
  ).length
  const showAvailabilityWarning =
    application.interviewsPublishedAt === null && availableCount < applicationGroups.length

  const steps = (
    [
      { label: "Opptak opprettet", status: "done" },
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
    ] satisfies Step[]
  ).map(
    (step, index, all): Step =>
      step.status === "upcoming" && index > 0 && all[index - 1].status !== "done"
        ? { label: step.label, status: "pending" }
        : step
  )

  const currentIndex = steps.findIndex((step) => step.status !== "done")
  const reachedIndex = currentIndex === -1 ? steps.length - 1 : currentIndex

  return (
    <ol
      className="grid h-full grid-cols-[auto_auto] gap-x-2"
      style={{ gridTemplateRows: `repeat(${steps.length - 1}, minmax(0, 1fr)) auto` }}
    >
      {steps.map(({ label, status, tooltip }, index) => {
        const { icon: StatusIcon, color, iconClass, ...text } = STATUSES[status]
        const pointer = currentIndex === -1 && index === steps.length - 1 ? "Gjennomført" : text.pointer

        return (
          <li key={label} className="col-span-full grid grid-cols-subgrid items-start">
            <span className="flex items-center justify-end gap-1.5">
              {pointer && (
                <Text
                  element="span"
                  className={cn("flex items-center gap-1 text-sm font-semibold leading-none", color)}
                >
                  {pointer}
                  <IconArrowRight className="size-4" stroke={3} />
                </Text>
              )}
              {label === "Søknadsperiode" && showAvailabilityWarning && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex text-destructive">
                      <PingingAlert className="size-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {`Kun ${availableCount}/${applicationGroups.length} komitéer har fylt ut tilgjengelighet`}
                  </TooltipContent>
                </Tooltip>
              )}
              <Text element="span" className={cn("text-base leading-none", index !== reachedIndex && "opacity-30")}>
                {label}
              </Text>
            </span>
            <div className="flex flex-col items-center self-stretch">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("-mt-1 inline-flex size-6", color, iconClass)}>
                    <StatusIcon className="size-full" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{tooltip ?? text.tooltip ?? text.pointer}</TooltipContent>
              </Tooltip>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex flex-1 flex-col items-center py-1",
                    index === reachedIndex ? color : "text-muted-foreground/40"
                  )}
                >
                  <div className="w-0.5 flex-1 bg-current" />
                  <IconChevronDown className="-mt-2 size-3.5 shrink-0" stroke={3} />
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
