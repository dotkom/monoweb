"use client"

import { AvailableInterviewTime } from "./AvailableInterviewTime"
import {
  COMMITTEE_APPLICATION_TIME_ZONE,
  isInterviewAvailabilityValid,
  type CommitteeApplicationInterviewAvailability,
  type CommitteeApplicationOpenPeriod,
} from "@dotkomonline/rpc/committee-application"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Text,
  Title,
  TextInput,
} from "@dotkomonline/ui"
import norwegianLocale from "@fullcalendar/core/locales/nb"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { tz } from "@date-fns/tz"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { useEffect, useState } from "react"
import { IconX } from "@tabler/icons-react"
import styles from "./InterviewAvailabilityStep.module.css"
import {
  getAvailableInterviewHours,
  getInterviewCalendarBounds,
  getApplicationInterviewWindows,
  subtractInterviewIntervals,
  formatCalendarTime,
  formatInterviewAvailability,
  getCalendarAvailability,
  getInterviewDateRange,
  mergeInterviewAvailability,
  parseInterviewAvailability,
} from "./interview-availability"

interface InterviewAvailabilityStepProps {
  applicationPeriod: CommitteeApplicationOpenPeriod
  unavailability: CommitteeApplicationInterviewAvailability[]
  onUnavailabilityChange: (unavailability: CommitteeApplicationInterviewAvailability[]) => void
}

export function InterviewAvailabilityStep({
  applicationPeriod,
  unavailability,
  onUnavailabilityChange,
}: InterviewAvailabilityStepProps) {
  const interviewWindows = getApplicationInterviewWindows(applicationPeriod)
  const remainingAvailability = subtractInterviewIntervals(interviewWindows, unavailability)
  const unavailableIntervals = subtractInterviewIntervals(interviewWindows, remainingAvailability)
  const availableHours = getAvailableInterviewHours(remainingAvailability)
  const calendarBounds = getInterviewCalendarBounds(interviewWindows)
  const interviewWeekdays = new Set(
    interviewWindows.map((interval) => {
      return Number(format(interval.startsAt, "i", { in: tz(COMMITTEE_APPLICATION_TIME_ZONE) })) % 7
    })
  )
  const hiddenDays = [0, 1, 2, 3, 4, 5, 6].filter((weekday) => !interviewWeekdays.has(weekday))
  const dateRange = getInterviewDateRange(applicationPeriod)
  const interviewDayCount = new Set(
    interviewWindows.map((interval) => formatCalendarTime(interval.startsAt).slice(0, 10))
  ).size
  const firstWindow = interviewWindows.at(0)
  const initialDate =
    firstWindow === undefined ? dateRange.start : formatCalendarTime(firstWindow.startsAt).slice(0, 10)
  const initialEnd =
    firstWindow === undefined
      ? "10:00"
      : formatCalendarTime(
          new Date(Math.min(firstWindow.startsAt.getTime() + 3_600_000, firstWindow.endsAt.getTime()))
        ).slice(11, 16)
  const [date, setDate] = useState(initialDate)
  const [startsAt, setStartsAt] = useState(calendarBounds.slotMinTime.slice(0, 5))
  const [endsAt, setEndsAt] = useState(initialEnd)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (expandedId === null) {
      return
    }

    const collapseOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-availability-expanded="true"]') === null) {
        setExpandedId(null)
      }
    }

    const collapseOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedId(null)
      }
    }

    document.addEventListener("pointerdown", collapseOnOutsideClick)

    document.addEventListener("keydown", collapseOnEscape)

    return () => {
      document.removeEventListener("pointerdown", collapseOnOutsideClick)

      document.removeEventListener("keydown", collapseOnEscape)
    }
  }, [expandedId])

  function addUnavailability(addedUnavailability: CommitteeApplicationInterviewAvailability) {
    if (!isInterviewAvailabilityValid(addedUnavailability, applicationPeriod)) {
      setErrorMessage("Velg et tidsrom innenfor én dag i intervjuperioden, med slutt etter start.")
      return false
    }

    const outsideWindows = subtractInterviewIntervals([addedUnavailability], interviewWindows)

    if (outsideWindows.length > 0) {
      setErrorMessage("Velg et tidsrom innenfor de oppsatte intervjutidene.")

      return false
    }

    onUnavailabilityChange(mergeInterviewAvailability(unavailability, addedUnavailability))
    setErrorMessage(null)
    return true
  }

  function removeUnavailability(startsAt: string) {
    setExpandedId(null)

    onUnavailabilityChange(unavailableIntervals.filter((interval) => interval.startsAt.toISOString() !== startsAt))
  }

  if (interviewWindows.length === 0) {
    return (
      <Text role="status" className="rounded-2xl border border-border bg-muted/40 p-5">
        Det er ikke lagt inn intervjutider for dette opptaket ennå. Ta kontakt med arrangørene før du sender søknaden.
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/50 bg-muted/40 p-5 sm:p-6">
        <Title element="h2" size="sm" className="mb-2">
          Når passer det ikke?
        </Title>
        <Text className="text-sm leading-relaxed text-muted-foreground">
          Alle intervjutidene er tilgjengelige fra start og vises i grønt. Marker bare tidene du ikke kan møte. Alle
          tider er i norsk tid.
        </Text>
      </section>
      <AvailableInterviewTime hours={availableHours} />
      <Text id="availability-calendar-description" className="text-sm text-gray-600 dark:text-stone-400">
        Klikk og dra for å markere når du ikke kan møte. På mobil holder du fingeren inne før du drar. Trykk på små
        tidsrom for å se detaljer.
      </Text>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-surface">
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border/40 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm border border-emerald-500/50 bg-emerald-500/20" />
            Kan møte
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-3 rounded-xs border border-rose-500 ${styles.unavailableSwatch}`}
            />
            Kan ikke møte
          </span>
        </div>
        <section
          aria-label="Intervjukalender"
          aria-describedby="availability-calendar-description"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to focus this region to scroll the interview dates.
          tabIndex={0}
          className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <div className={styles.calendar} style={{ minWidth: `${interviewDayCount * 112 + 56}px` }}>
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              locale={norwegianLocale}
              timeZone={COMMITTEE_APPLICATION_TIME_ZONE}
              initialView="interviewPeriod"
              views={{ interviewPeriod: { type: "timeGrid" } }}
              initialDate={initialDate}
              validRange={{ start: dateRange.start, end: dateRange.end }}
              visibleRange={{ start: dateRange.start, end: dateRange.end }}
              headerToolbar={false}
              hiddenDays={hiddenDays}
              dayHeaderContent={(day) => (
                <span className="flex h-8 items-center justify-center whitespace-nowrap px-2 text-xs font-medium text-muted-foreground">
                  {format(day.date, "EEE d. MMM", { in: tz("UTC"), locale: nb })}
                </span>
              )}
              allDaySlot={false}
              slotMinTime={calendarBounds.slotMinTime}
              slotMaxTime={calendarBounds.slotMaxTime}
              slotDuration="00:30:00"
              snapDuration="00:10:00"
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              height="auto"
              eventMinHeight={0}
              eventShortHeight={0}
              slotEventOverlap={false}
              selectable
              selectMirror
              selectLongPressDelay={250}
              selectAllow={(selection) => {
                const interval = getCalendarAvailability(selection.start, selection.end)

                return (
                  !selection.allDay &&
                  isInterviewAvailabilityValid(interval, applicationPeriod) &&
                  subtractInterviewIntervals([interval], interviewWindows).length === 0
                )
              }}
              select={(selection) => {
                addUnavailability(getCalendarAvailability(selection.start, selection.end))
                selection.view.calendar.unselect()
              }}
              events={[
                ...remainingAvailability.map((interval) => {
                  return {
                    start: formatCalendarTime(interval.startsAt),

                    end: formatCalendarTime(interval.endsAt),

                    display: "background",

                    classNames: [styles.available],

                    extendedProps: { isAvailable: true },
                  }
                }),

                ...interviewWindows.map((interval) => ({
                  groupId: "interview-windows",
                  start: formatCalendarTime(interval.startsAt),
                  end: formatCalendarTime(interval.endsAt),
                  display: "inverse-background",
                  backgroundColor: "var(--muted)",
                })),
                ...unavailableIntervals.map((interval) => ({
                  id: interval.startsAt.toISOString(),
                  title: "Kan ikke møte",
                  start: formatCalendarTime(interval.startsAt),
                  end: formatCalendarTime(interval.endsAt),
                  extendedProps: { availabilityLabel: formatInterviewAvailability(interval), isUnavailable: true },
                })),
              ]}
              eventContent={(event) => {
                if (event.event.extendedProps.isUnavailable !== true) {
                  return null
                }

                const isExpanded = expandedId === event.event.id

                const availabilityLabel = event.event.extendedProps.availabilityLabel

                return (
                  <div data-availability-expanded={isExpanded}>
                    <button
                      type="button"
                      className="absolute inset-0 size-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [@container_interview-event_(min-height:40px)]:hidden"
                      aria-label={`Vis tidsrom: ${availabilityLabel}`}
                      aria-expanded={isExpanded}
                      onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                      onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()

                        setExpandedId(event.event.id)
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden px-1.5 pr-6 [@container_interview-event_(min-height:40px)]:pt-1">
                      <div className="hidden truncate text-[0.6875rem] leading-4 font-semibold tabular-nums [@container_interview-event_(min-height:18px)]:block">
                        {event.timeText}
                      </div>
                      <div className="hidden truncate text-[0.6875rem] leading-4 [@container_interview-event_(min-height:40px)]:block">
                        {event.event.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="absolute top-0 right-0 hidden h-4.5 w-5 cursor-pointer items-center justify-center rounded-xs hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [@container_interview-event_(min-height:18px)]:flex"
                      aria-label={`Fjern ${availabilityLabel}`}
                      title="Gjør tidsrommet tilgjengelig igjen"
                      onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                      onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()

                        removeUnavailability(event.event.id)
                      }}
                    >
                      <IconX size={14} aria-hidden="true" />
                    </button>
                  </div>
                )
              }}
              eventDidMount={(event) => {
                if (event.event.extendedProps.isUnavailable !== true) {
                  event.el.setAttribute("aria-hidden", "true")
                }
              }}
            />
          </div>
        </section>
        <Dialog
          open={isManualEntryOpen}
          onOpenChange={(open) => {
            setIsManualEntryOpen(open)
            setErrorMessage(null)
          }}
        >
          <div className="flex justify-end border-t border-border/40 px-3 py-2">
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="unstyled"
                className="cursor-pointer rounded px-1 py-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Legg til tidspunkt manuelt
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent size="lg" className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Legg til tidspunkt manuelt</DialogTitle>
              <DialogDescription>
                Velg et tidsrom du ikke kan møte, innenfor de oppsatte intervjutidene. Alle tider er i norsk tid.
              </DialogDescription>
            </DialogHeader>
            <form
              noValidate
              className="flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()

                if (addUnavailability(parseInterviewAvailability(date, startsAt, endsAt))) {
                  setIsManualEntryOpen(false)
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <TextInput
                  id="availability-date"
                  type="date"
                  label="Dato"
                  min={dateRange.start}
                  max={dateRange.lastDay}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <TextInput
                  id="availability-start"
                  type="time"
                  label="Fra"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
                <TextInput
                  id="availability-end"
                  type="time"
                  label="Til"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </div>
              {errorMessage !== null && (
                <Text role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </Text>
              )}
              <div className="flex justify-end gap-2">
                <DialogClose type="button" variant="outline" size="default">
                  Avbryt
                </DialogClose>
                <Button type="submit" variant="default">
                  Legg til tidsrom
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
