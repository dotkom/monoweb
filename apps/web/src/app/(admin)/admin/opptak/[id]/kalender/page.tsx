"use client"

import { Button, Text, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { IconSend } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { useState } from "react"
import { useApplicationContext } from "../layout"
import { COMMITTEES, useCommitteeAvailabilities } from "../committees"
import { AvailabilityCalendar } from "./lol"

export default function ApplicationCalendarPage() {
  const { application } = useApplicationContext()
  const { availabilities, setSlots, submit } = useCommitteeAvailabilities()
  const [committeeSlug, setCommitteeSlug] = useState(COMMITTEES[0].slug)

  const availability = availabilities[committeeSlug]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Title element="h2" className="text-2xl">
          Intervjutidspunkter
        </Title>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          multiple={false}
          value={[committeeSlug]}
          onValueChange={(next) => {
            const value = next.at(0)

            if (value !== undefined) {
              setCommitteeSlug(value)
            }
          }}
        >
          {COMMITTEES.map((committee) => (
            <ToggleGroupItem key={committee.slug} value={committee.slug}>
              {committee.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-3">
          {availability.submittedAt !== null && (
            <Text size="sm" className="text-gray-600 dark:text-stone-400">
              Sendt inn {formatDate(availability.submittedAt, "dd. MMM yyyy HH:mm", { locale: nb })}
            </Text>
          )}
          <Button
            variant="default"
            icon={<IconSend />}
            disabled={availability.slots.length === 0}
            onClick={() => submit(committeeSlug)}
          >
            Lagre tider
          </Button>
        </div>
      </div>

      <AvailabilityCalendar
        initialDate={application.interviewStartDate}
        dayStartMinutes={application.dayStartMinutes}
        dayEndMinutes={application.dayEndMinutes}
        slotLengthMinutes={application.slotLengthMinutes}
        selected={availability.slots}
        onChange={(slots) => setSlots(committeeSlug, slots)}
      />
    </div>
  )
}
