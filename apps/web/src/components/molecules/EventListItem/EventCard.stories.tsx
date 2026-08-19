import { Text } from "@dotkomonline/ui"
import { addDays } from "date-fns"
import {
  createMockAttendanceSummary,
  createMockAttendee,
  createMockEvent,
  createMockUser,
  MOCK_USER_ID,
} from "../../../../.ladle/fixtures/attendance"
import { EventCard } from "./EventCard"

const createReservedAttendees = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    createMockAttendee({
      id: `00000000-0000-4000-8000-0000000001${index}`,
      userId: `00000000-0000-4000-8000-0000000000${index + 1}`,
      user: createMockUser({
        id: `00000000-0000-4000-8000-0000000000${index + 1}`,
        username: `bruker${index + 1}`,
      }),
      reserved: true,
    })
  )

const baseEvent = createMockEvent({
  title: "Kurs i fixtures",
  locationTitle: "R7, Realfagbygget",
  type: "SOCIAL",
})

export default {
  title: "Event Card",
  component: EventCard,
}

export const Default = () => {
  const attendance = createMockAttendanceSummary({
    attendancePrice: 100,
    capacity: 20,
    attendees: createReservedAttendees(4),
  })

  return (
    <div className="max-w-sm">
      <EventCard event={baseEvent} attendance={attendance} />
    </div>
  )
}

export const AllStates = () => {
  const user = createMockUser()
  const reservedAttendee = createMockAttendee({ user, reserved: true })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Open with price</Text>
        <EventCard
          event={baseEvent}
          attendance={createMockAttendanceSummary({
            attendancePrice: 100,
            capacity: 20,
            attendees: createReservedAttendees(4),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Free event</Text>
        <EventCard
          event={baseEvent}
          attendance={createMockAttendanceSummary({ capacity: 20, attendees: createReservedAttendees(4) })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Reserved attendee</Text>
        <EventCard
          event={baseEvent}
          attendance={createMockAttendanceSummary({
            attendancePrice: 100,
            capacity: 20,
            attendees: [reservedAttendee],
            currentUserAttendee: reservedAttendee,
          })}
          userId={MOCK_USER_ID}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Past event</Text>
        <EventCard
          event={createMockEvent({
            ...baseEvent,
            start: addDays(new Date(), -7),
            end: addDays(new Date(), -7),
          })}
          attendance={createMockAttendanceSummary({
            attendancePrice: 100,
            capacity: 20,
            attendees: createReservedAttendees(20),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">No location</Text>
        <EventCard
          event={createMockEvent({ title: "Kurs i fixtures", locationTitle: null, type: "ACADEMIC" })}
          attendance={createMockAttendanceSummary({
            attendancePrice: 100,
            capacity: 20,
            attendees: createReservedAttendees(4),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">No attendance, with location</Text>
        <EventCard event={baseEvent} attendance={null} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">No location or attendance</Text>
        <EventCard
          event={createMockEvent({ title: "Kurs i fixtures", locationTitle: null, type: "OTHER" })}
          attendance={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not opened</Text>
        <EventCard
          event={baseEvent}
          attendance={createMockAttendanceSummary({ status: "NOT_OPENED", attendancePrice: 100, capacity: 20 })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Multiple days</Text>
        <EventCard
          event={createMockEvent({
            ...baseEvent,
            title: "Hackathon",
            start: new Date(2026, 7, 8, 10, 0),
            end: new Date(2026, 7, 10, 18, 0),
          })}
          attendance={createMockAttendanceSummary({
            attendancePrice: 100,
            capacity: 40,
            attendees: createReservedAttendees(12),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Spans month change</Text>
        <EventCard
          event={createMockEvent({
            ...baseEvent,
            title: "Fadderukemarkup",
            start: new Date(2026, 7, 28, 12, 0),
            end: new Date(2026, 8, 2, 23, 59),
          })}
          attendance={createMockAttendanceSummary({
            capacity: 100,
            attendees: createReservedAttendees(56),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Spans year change</Text>
        <EventCard
          event={createMockEvent({
            ...baseEvent,
            title: "Nyttårskveld",
            start: new Date(2026, 11, 31, 20, 0),
            end: new Date(2027, 0, 1, 4, 0),
          })}
          attendance={createMockAttendanceSummary({
            attendancePrice: 150,
            capacity: 80,
            attendees: createReservedAttendees(80),
          })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Long ass metadata</Text>
        <EventCard
          event={createMockEvent({
            ...baseEvent,
            title: "Kakefest på kontoret",
            start: new Date(2026, 9, 17, 20, 0),
            end: new Date(2026, 9, 17, 22, 0),
            locationTitle:
              "På kontoret, men i det ene hjørnet på siden av bygget som får mest sol morgen etter den 3. nymånen i året",
          })}
          attendance={createMockAttendanceSummary({
            attendancePrice: 150,
            capacity: 80,
            attendees: createReservedAttendees(80),
          })}
        />
      </div>
    </div>
  )
}
