"use client"

import {
  COMMITTEE_APPLICATION_INTERVIEW_HOURS,
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
  TextInput,
} from "@dotkomonline/ui"
import norwegianLocale from "@fullcalendar/core/locales/nb"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { tz } from "@date-fns/tz"
import { differenceInCalendarDays, format } from "date-fns"
import { nb } from "date-fns/locale"
import { useState } from "react"
import styles from "./InterviewAvailabilityStep.module.css"
import {
  formatCalendarTime,
  formatInterviewAvailability,
  getCalendarAvailability,
  getInterviewDateRange,
  mergeInterviewAvailability,
  parseInterviewAvailability,
} from "./interview-availability"

interface InterviewAvailabilityStepProps {
  applicationPeriod: CommitteeApplicationOpenPeriod
  availability: CommitteeApplicationInterviewAvailability[]
  onAvailabilityChange: (availability: CommitteeApplicationInterviewAvailability[]) => void
}

export function InterviewAvailabilityStep({
  applicationPeriod,
  availability,
  onAvailabilityChange,
}: InterviewAvailabilityStepProps) {
  const dateRange = getInterviewDateRange(applicationPeriod)
  const interviewDayCount =
    differenceInCalendarDays(applicationPeriod.interviewsEndDate, applicationPeriod.interviewsStartDate, {
      in: tz("UTC"),
    }) + 1
  const [date, setDate] = useState(dateRange.start)
  const [startsAt, setStartsAt] = useState<string>(COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt)
  const [endsAt, setEndsAt] = useState("10:00")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)

  function addAvailability(addedAvailability: CommitteeApplicationInterviewAvailability) {
    if (!isInterviewAvailabilityValid(addedAvailability, applicationPeriod)) {
      setErrorMessage("Velg et tidsrom i intervjuperioden, innenfor åpningstidene, med slutt etter start.")
      return false
    }

    onAvailabilityChange(mergeInterviewAvailability(availability, addedAvailability))
    setErrorMessage(null)
    return true
  }

  function removeAvailability(startsAt: string) {
    onAvailabilityChange(availability.filter((interval) => interval.startsAt.toISOString() !== startsAt))
  }

  return (
    <div className="flex flex-col gap-6">
      <Text>
        Marker minst ett tidsrom der du er tilgjengelig for intervju. Alle tider er i norsk tid, mellom{" "}
        {COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt} og {COMMITTEE_APPLICATION_INTERVIEW_HOURS.endsAt}.
      </Text>
      <Text id="availability-calendar-description" className="text-sm text-gray-600 dark:text-stone-400">
        Klikk og dra for å legge til et tidsrom. På mobil holder du fingeren inne før du drar. Klikk på et valgt tidsrom
        for å fjerne det.
      </Text>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-surface">
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
              timeZone={COMMITTEE_APPLICATION_INTERVIEW_HOURS.timeZone}
              initialView="interviewPeriod"
              views={{ interviewPeriod: { type: "timeGrid" } }}
              initialDate={dateRange.start}
              validRange={{ start: dateRange.start, end: dateRange.end }}
              visibleRange={{ start: dateRange.start, end: dateRange.end }}
              headerToolbar={false}
              dayHeaderContent={(day) => (
                <span className="flex h-8 items-center justify-center whitespace-nowrap px-2 text-xs font-medium text-muted-foreground">
                  {format(day.date, "EEE d. MMM", { in: tz("UTC"), locale: nb })}
                </span>
              )}
              allDaySlot={false}
              slotMinTime={COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt}
              slotMaxTime={COMMITTEE_APPLICATION_INTERVIEW_HOURS.endsAt}
              slotDuration="00:30:00"
              snapDuration="00:10:00"
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              height="auto"
              selectable
              selectMirror
              selectLongPressDelay={250}
              selectAllow={(selection) =>
                !selection.allDay &&
                isInterviewAvailabilityValid(getCalendarAvailability(selection.start, selection.end), applicationPeriod)
              }
              select={(selection) => {
                addAvailability(getCalendarAvailability(selection.start, selection.end))
                selection.view.calendar.unselect()
              }}
              events={availability.map((interval) => ({
                id: interval.startsAt.toISOString(),
                title: "Tilgjengelig",
                start: formatCalendarTime(interval.startsAt),
                end: formatCalendarTime(interval.endsAt),
                extendedProps: { availabilityLabel: formatInterviewAvailability(interval) },
              }))}
              eventContent={(event) => (
                <div>
                  <span className="sr-only">Fjern {event.event.extendedProps.availabilityLabel}</span>
                  <div aria-hidden>
                    <div className="fc-event-time">{event.timeText}</div>
                    <div className="fc-event-title">{event.event.title}</div>
                  </div>
                </div>
              )}
              eventDidMount={(event) => {
                event.el.tabIndex = 0
                event.el.setAttribute("role", "button")
                event.el.addEventListener("keydown", (keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault()
                    event.el.click()
                  }
                })
              }}
              eventClick={(event) => removeAvailability(event.event.id)}
            />
          </div>
        </section>
        <Dialog
          open={manualEntryOpen}
          onOpenChange={(open) => {
            setManualEntryOpen(open)
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
                Velg et tidsrom i intervjuperioden mellom {COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt} og{" "}
                {COMMITTEE_APPLICATION_INTERVIEW_HOURS.endsAt}. Alle tider er i norsk tid.
              </DialogDescription>
            </DialogHeader>
            <form
              noValidate
              className="flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()

                if (addAvailability(parseInterviewAvailability(date, startsAt, endsAt))) {
                  setManualEntryOpen(false)
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
                  min={COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt}
                  max={COMMITTEE_APPLICATION_INTERVIEW_HOURS.endsAt}
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
                <TextInput
                  id="availability-end"
                  type="time"
                  label="Til"
                  min={COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt}
                  max={COMMITTEE_APPLICATION_INTERVIEW_HOURS.endsAt}
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
