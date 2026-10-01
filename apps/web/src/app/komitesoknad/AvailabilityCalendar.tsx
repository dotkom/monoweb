"use client"

import {
  AvailabilityCalendar as WeeklyAvailabilityCalendar,
  type AvailabilitySlot,
} from "react-weekly-availability-calendar"
import "./weekly-calendar.css"

export const interviewDays = ["Man 5. okt", "Tir 6. okt", "Ons 7. okt", "Tor 8. okt", "Fre 9. okt"]
const dayLabels = ["Søn 11. okt", ...interviewDays, "Lør 10. okt"]

export function getAvailableRanges(day: string, selected: AvailabilitySlot[]) {
  return selected
    .filter((slot) => slot.dayOfWeek === interviewDays.indexOf(day) + 1)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((slot) => `${slot.startTime}–${slot.endTime}`)
}

export function AvailabilityCalendar({
  selected,
  onChange,
}: {
  selected: AvailabilitySlot[]
  onChange: (selected: AvailabilitySlot[]) => void
}) {
  return (
    <section aria-labelledby="availability-heading" className="mt-6 sm:mt-8">
      <h2 id="availability-heading" className="sr-only">
        Intervjutider
      </h2>
      <WeeklyAvailabilityCalendar
        className="interview-calendar"
        slots={selected}
        onSlotsChange={onChange}
        snapMinutes={15}
        minSlotMinutes={15}
        timeFormat="24"
        startDay={1}
        startHour={9}
        endHour={17}
        disabledDays={[0, 6]}
        locale="nb-NO"
        dayLabelFormat={(day) => dayLabels[day]}
        theme={{
          slotBackground: "#dcfce7",
          slotTextColor: "#14532d",
          slotBorderColor: "#16a34a",
          previewBackground: "#dcfce7",
          previewBorderColor: "#16a34a",
        }}
      />
    </section>
  )
}
