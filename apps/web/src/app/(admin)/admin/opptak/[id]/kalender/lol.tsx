"use client"

import type { DateSelectArg, EventChangeArg, EventContentArg, EventInput } from "@fullcalendar/core"
import nbLocale from "@fullcalendar/core/locales/nb"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { useMemo } from "react"
import { formatMinutesOfDay } from "../../opptak"
import { DayHeader } from "./dritt"
import { type InterviewSlot, SlotContent } from "./faen"

export type { InterviewSlot }

const SLOT_BACKGROUND = "#dcfce7"
const SLOT_BORDER = "#16a34a"
const SLOT_TEXT = "#14532d"

interface AvailabilityCalendarProps {
  initialDate: Date
  dayStartMinutes: number
  dayEndMinutes: number
  slotLengthMinutes: number
  selected: InterviewSlot[]
  onChange: (selected: InterviewSlot[]) => void
}

export function AvailabilityCalendar({
  initialDate,
  dayStartMinutes,
  dayEndMinutes,
  slotLengthMinutes,
  selected,
  onChange,
}: AvailabilityCalendarProps) {
  const events: EventInput[] = useMemo(
    () => selected.map((slot) => ({ id: slot.id, start: slot.start, end: slot.end })),
    [selected]
  )

  const handleSelect = (arg: DateSelectArg) => {
    arg.view.calendar.unselect()
    onChange([
      ...selected,
      { id: crypto.randomUUID(), start: arg.start.toISOString(), end: arg.end.toISOString(), room: "", link: "" },
    ])
  }

  const handleEventChange = (arg: EventChangeArg) => {
    const { id, start, end } = arg.event

    if (start === null || end === null) {
      return
    }

    onChange(
      selected.map((slot) => (slot.id === id ? { ...slot, start: start.toISOString(), end: end.toISOString() } : slot))
    )
  }

  const renderEvent = (arg: EventContentArg) => {
    const slot = selected.find((candidate) => candidate.id === arg.event.id)

    if (slot === undefined) {
      return null
    }

    return (
      <SlotContent
        slot={slot}
        timeText={arg.timeText}
        onUpdate={(patch) => onChange(selected.map((item) => (item.id === slot.id ? { ...item, ...patch } : item)))}
        onRemove={() => onChange(selected.filter((item) => item.id !== slot.id))}
      />
    )
  }

  return (
    <section aria-labelledby="availability-heading" className="[&_.fc-timegrid-event_.fc-event-main]:p-0!">
      <h2 id="availability-heading" className="sr-only">
        Intervjutider
      </h2>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={initialDate}
        locale={nbLocale}
        headerToolbar={false}
        weekends={false}
        allDaySlot={false}
        height="auto"
        slotMinTime={formatMinutesOfDay(dayStartMinutes)}
        slotMaxTime={formatMinutesOfDay(dayEndMinutes)}
        slotDuration={{ minutes: slotLengthMinutes }}
        snapDuration={{ minutes: slotLengthMinutes }}
        slotLabelInterval="01:00"
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        dayHeaderContent={(arg) => <DayHeader date={arg.date} />}
        slotEventOverlap
        selectable
        selectMirror
        editable
        eventResizableFromStart
        eventBackgroundColor={SLOT_BACKGROUND}
        eventBorderColor={SLOT_BORDER}
        eventTextColor={SLOT_TEXT}
        events={events}
        select={handleSelect}
        eventChange={handleEventChange}
        eventContent={renderEvent}
      />
    </section>
  )
}
