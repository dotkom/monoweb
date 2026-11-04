import type { Attendance, Attendee } from "@dotkomonline/rpc/attendance"
import { Text } from "@dotkomonline/ui"
import { addHours, subHours } from "date-fns"
import {
  createAttendanceWithPaymentCountdown,
  createMockAttendance,
  createMockAttendee,
} from "../../../../.ladle/fixtures/attendance"
import { AttendanceStatus } from "./AttendanceStatus"

export default {
  title: "Attendance Status",
  component: AttendanceStatus,
}

const sizeOptions = [
  { size: "sm", label: "Small" },
  { size: "default", label: "Default" },
  { size: "lg", label: "Large" },
] as const

interface StateShowcaseProps {
  label: string
  withCapacityAttendance: Attendance
  withCapacityAttendee: Attendee | null
  eventEndInPast: boolean
}

const StateShowcase = ({ label, withCapacityAttendance, withCapacityAttendee, eventEndInPast }: StateShowcaseProps) => (
  <div className="flex flex-col gap-3">
    <Text className="text-sm text-muted-foreground">{label}</Text>

    {sizeOptions.map((sizeOption) => (
      <div key={sizeOption.size} className="flex flex-row items-start gap-4">
        <Text className="text-xs text-muted-foreground w-16 shrink-0 pt-1">{sizeOption.label}</Text>

        <div className="flex flex-col gap-2">
          <AttendanceStatus
            attendance={withCapacityAttendance}
            attendee={withCapacityAttendee}
            eventEndInPast={eventEndInPast}
            size={sizeOption.size}
          />

          <AttendanceStatus
            attendance={{
              ...withCapacityAttendance,
              pools: withCapacityAttendance.pools.map((pool) => ({ ...pool, capacity: 0 })),
            }}
            attendee={withCapacityAttendee}
            eventEndInPast={eventEndInPast}
            size={sizeOption.size}
          />
        </div>
      </div>
    ))}
  </div>
)

export const AllStates = () => {
  const now = new Date()
  const viewerStates = [
    { label: "Not attending", attendee: null },
    { label: "Registered", attendee: createMockAttendee({ registeredAt: new Date() }) },
    { label: "Queued", attendee: createMockAttendee({ registeredAt: null }) },
    {
      label: "Delayed",
      attendee: createMockAttendee({ registeredAt: null, registrationEligibleAt: addHours(now, 4) }),
    },
  ]
  const phases = [
    { label: "Open", registrationClosed: false, deregistrationClosed: false, eventEndInPast: false },
    {
      label: "Registration closed, before deregister deadline",
      registrationClosed: true,
      deregistrationClosed: false,
      eventEndInPast: false,
    },
    {
      label: "After deregister deadline, registration open",
      registrationClosed: false,
      deregistrationClosed: true,
      eventEndInPast: false,
    },
    {
      label: "Registration closed, after deregister deadline",
      registrationClosed: true,
      deregistrationClosed: true,
      eventEndInPast: false,
    },
    { label: "Past event", registrationClosed: true, deregistrationClosed: true, eventEndInPast: true },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <StateShowcase
        label="Not opened"
        withCapacityAttendance={createMockAttendance({ status: "NOT_OPENED" })}
        withCapacityAttendee={null}
        eventEndInPast={false}
      />

      {phases.flatMap((phase) =>
        viewerStates.map((viewer) => (
          <StateShowcase
            key={`${phase.label}-${viewer.label}`}
            label={`${phase.label} · ${viewer.label}`}
            withCapacityAttendance={{
              ...createMockAttendance({ attendees: viewer.attendee ? [viewer.attendee] : [] }),
              registerStart: subHours(now, 48),
              registerEnd: phase.registrationClosed ? subHours(now, 2) : addHours(now, 12),
              deregisterDeadline: phase.deregistrationClosed ? subHours(now, 1) : addHours(now, 24),
            }}
            withCapacityAttendee={viewer.attendee}
            eventEndInPast={phase.eventEndInPast}
          />
        ))
      )}

      {[true, false].flatMap((registered) =>
        ["Pending", "Overdue", "Paid"].map((paymentState) => {
          const attendance = createAttendanceWithPaymentCountdown(registered)
          const attendee = attendance.attendees[0]
          if (!attendee) {
            return null
          }
          const paymentAttendee = {
            ...attendee,
            completionDeadline: paymentState === "Overdue" ? subHours(now, 1) : addHours(now, 1),
            paymentReservedAt: paymentState === "Paid" ? now : null,
          }

          return (
            <StateShowcase
              key={`${registered}-${paymentState}`}
              label={`Payment ${paymentState.toLowerCase()} · ${registered ? "Registered" : "Queued"}`}
              withCapacityAttendance={{ ...attendance, attendees: [paymentAttendee] }}
              withCapacityAttendee={paymentAttendee}
              eventEndInPast={false}
            />
          )
        })
      )}
    </div>
  )
}
