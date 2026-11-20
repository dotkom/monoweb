"use client"

import { type CommitteeApplicationPeriod, getInterviewDays } from "@dotkomonline/rpc/committee-application"
import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconAlertTriangle, IconArrowRight, IconCheck, IconCircleDashed, IconHourglassEmpty } from "@tabler/icons-react"
import { formatDate, isPast, subMilliseconds } from "date-fns"
import { nb } from "date-fns/locale"
import type { ComponentType } from "react"
import { useHasPassed } from "../queries"

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
    pointer?: string
  }
> = {
  done: { icon: IconCheck, color: GREEN },
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
  },
}

const periodStep = (label: string, start: Date, end: Date): Step =>
  isPast(end)
    ? { label, status: "done" }
    : isPast(start)
      ? { label, status: "ongoing", tooltip: `${label} ender ${formatDate(end, "HH:mm d. MMMM", { locale: nb })}` }
      : { label, status: "upcoming", tooltip: `${label} starter ${formatDate(start, "HH:mm d. MMMM", { locale: nb })}` }

export const Progress = ({ application }: { application: CommitteeApplicationPeriod }) => {
  const interviewDays = getInterviewDays(application)
  const hasApplicationPeriodClosed = useHasPassed(application.applicationsCloseAt)
  const steps = (
    [
      { label: "Opptak opprettet", status: "done" },
      periodStep("Søknadsperiode", application.applicationsOpenAt, application.applicationsCloseAt),
      {
        label: "Matching & publisering",
        status: application.interviewsPublishedAt ? "done" : hasApplicationPeriodClosed ? "ready" : "pending",
      },
      periodStep("Intervjuperiode", interviewDays.startsAt, subMilliseconds(interviewDays.endsAt, 1)),
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
    <ol className="flex h-full w-80 flex-col gap-1">
      {steps.map(({ label, status, tooltip }, index) => {
        const { icon: StatusIcon, color, iconClass, pointer } = STATUSES[status]
        const iconSpan = (
          <span
            className={cn(
              "inline-flex shrink-0",
              index === reachedIndex ? "size-10 rounded-full bg-current/10 p-2" : "size-5",
              color,
              iconClass
            )}
          >
            <StatusIcon className="size-full" />
          </span>
        )
        const icon = tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{iconSpan}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          iconSpan
        )

        if (index === reachedIndex) {
          return (
            <li
              key={label}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg bg-background px-3 py-2 shadow-[0_0_12px_rgb(0_0_0/0.15)]",
                color
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Text element="span" className="truncate text-base font-medium leading-tight text-foreground">
                  {label}
                </Text>
                <span className="flex items-center gap-1 text-sm font-semibold leading-tight">
                  {pointer ?? "Gjennomført"}
                  <IconArrowRight className="size-3.5 shrink-0" stroke={3} />
                </span>
              </div>
              {icon}
            </li>
          )
        }

        return (
          <li key={label} className="flex min-h-5 flex-1 items-center justify-end gap-3 pr-5.5">
            <Text element="span" className="truncate text-sm leading-5 opacity-40">
              {label}
            </Text>
            {icon}
          </li>
        )
      })}
    </ol>
  )
}
