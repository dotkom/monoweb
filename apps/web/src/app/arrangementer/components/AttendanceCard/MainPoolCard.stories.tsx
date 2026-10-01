import { Text } from "@dotkomonline/ui"
import { addDays, isPast } from "date-fns"
import { useEffect, useState, type ReactNode } from "react"
import { getAttendee } from "@dotkomonline/rpc/attendance"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import {
  createAttendanceOpeningSoon,
  createAttendanceOpeningSoonWithPrice,
  createAttendanceWithPaymentCountdown,
  createAttendanceWithPaymentRecord,
  createAttendanceWithQueue,
  createAttendanceWithQueuedPayment,
  createAttendanceWithQueuedPaymentRecord,
  createAttendanceWithRegisteredPaymentRecord,
  createAttendanceWithPaymentAndSelectionsPending,
  createAttendanceWithPaymentAndSelectionsPendingPastDeregisterDeadline,
  createAttendanceWithPaymentCompleteSelectionsPending,
  createAttendanceWithSelectionsPendingPastDeregisterDeadline,
  createAttendanceWithRegisteredUser,
  createAttendanceWithReservedPayment,
  createAttendanceWithSelectionsComplete,
  createAttendanceWithSelectionsCompletePaymentPending,
  createAttendanceWithSelectionsPending,
  createAttendanceWithServingPunishment,
  createIneligiblePoolAttendance,
  createMockAttendance,
  createMockAttendee,
  createMockRegistrationAvailabilityForAttendee,
  createMockRegistrationAvailabilityPastDeregisterDeadline,
  createMockUser,
} from "../../../../../.ladle/fixtures/attendance"
import { MainPoolCard, type CompletionHighlightTarget } from "./MainPoolCard"

const AUTHORIZE_URL = "/api/auth/login"
const SIMULATION_CAPACITY = 120

const MainPoolCardPreview = ({
  attendance,
  user,
  chargeScheduleDate,
}: {
  attendance: Attendance
  user: User | null
  chargeScheduleDate?: Date | null
}) => {
  const attendee = getAttendee(attendance, user)

  const [, setCompletionHighlightTarget] = useState<CompletionHighlightTarget>(null)

  const registrationAvailability =
    user === null || attendee === null
      ? null
      : isPast(attendance.deregisterDeadline)
        ? createMockRegistrationAvailabilityPastDeregisterDeadline(attendance, attendee)
        : createMockRegistrationAvailabilityForAttendee(attendance, attendee)

  return (
    <MainPoolCard
      attendance={attendance}
      user={user}
      authorizeUrl={AUTHORIZE_URL}
      chargeScheduleDate={chargeScheduleDate}
      registrationAvailability={registrationAvailability}
      setCompletionHighlightTarget={setCompletionHighlightTarget}
      isCompletionHighlightHidden={false}
      onToggleCompletionHighlightHidden={() => setCompletionHighlightTarget(null)}
    />
  )
}

// The goal is to make the registration go very fast at the start, and then slows down as the pool fills up
const getTickDelayMilliseconds = (registeredCount: number): number => {
  if (registeredCount < 50) {
    return 100 // 10/s
  }

  if (registeredCount < 102) {
    return 200
  }

  if (registeredCount < 111) {
    return 1000
  }

  return 3000
}

export const ActiveRegistration = () => {
  const [registeredCount, setRegisteredCount] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRegisteredCount((currentCount) => (currentCount >= SIMULATION_CAPACITY ? 0 : currentCount + 1))
    }, getTickDelayMilliseconds(registeredCount))

    return () => clearTimeout(timeout)
  }, [registeredCount])

  // After 20 "registrations", 1 of 3 new registrations have an accompanying waitlist/queue entry
  const queuedCount = registeredCount < 20 ? 0 : Math.floor((registeredCount - 20) / 3)
  const attendees = [
    ...Array.from({ length: registeredCount }, () => createMockAttendee({ registered: true })),
    ...Array.from({ length: queuedCount }, () => createMockAttendee({ registered: false })),
  ]

  const attendance = createMockAttendance({ capacity: SIMULATION_CAPACITY, attendees })
  const viewer = createMockUser({ id: "00000000-0000-4000-8000-000000000999" })

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <Text className="text-sm text-muted-foreground">Aktiv påmelding</Text>
      <MainPoolCardPreview attendance={attendance} user={viewer} />
    </div>
  )
}

export default {
  title: "Attendance Card/Main Pool Card",
  component: MainPoolCard,
}

const StatePreview = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      {children}
    </div>
  )
}

export const AllStates = () => {
  const user = createMockUser()
  const chargeScheduleDate = addDays(new Date(), 3)

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <StatePreview label="Not logged in">
        <MainPoolCardPreview attendance={createMockAttendance({ attendancePrice: 100 })} user={null} />
      </StatePreview>

      <StatePreview label="No membership">
        <MainPoolCardPreview
          attendance={createMockAttendance({ attendancePrice: 100 })}
          user={createMockUser({ memberships: [] })}
        />
      </StatePreview>

      <StatePreview label="Ineligible pool">
        <MainPoolCardPreview attendance={createIneligiblePoolAttendance()} user={user} />
      </StatePreview>

      <StatePreview label="Not registered">
        <MainPoolCardPreview attendance={createMockAttendance()} user={user} />
      </StatePreview>

      <StatePreview label="Not registered, others are queued">
        <MainPoolCardPreview
          attendance={createAttendanceWithQueue({
            capacity: 2,
            registeredOtherCount: 2,
            queuedOtherCount: 3,
            viewer: "absent",
          })}
          user={user}
        />
      </StatePreview>

      <StatePreview label="Registered">
        <MainPoolCardPreview attendance={createAttendanceWithRegisteredUser()} user={user} />
      </StatePreview>

      <StatePreview label="Registered, others are queued">
        <MainPoolCardPreview
          attendance={createAttendanceWithQueue({
            capacity: 2,
            registeredOtherCount: 1,
            queuedOtherCount: 2,
            viewer: "reserved",
          })}
          user={user}
        />
      </StatePreview>

      <StatePreview label="In queue">
        <MainPoolCardPreview
          attendance={createAttendanceWithQueue({
            capacity: 2,
            registeredOtherCount: 2,
            queuedOtherCount: 2,
            viewer: "queued",
            viewerQueuePosition: 2,
          })}
          user={user}
        />
      </StatePreview>

      <StatePreview label="Register countdown">
        <MainPoolCardPreview attendance={createAttendanceOpeningSoon()} user={user} />
      </StatePreview>

      <StatePreview label="Register countdown with price">
        <MainPoolCardPreview attendance={createAttendanceOpeningSoonWithPrice()} user={user} />
      </StatePreview>

      <StatePreview label="Completion countdown">
        <MainPoolCardPreview attendance={createAttendanceWithPaymentCountdown()} user={user} />
      </StatePreview>

      <StatePreview label="Completion countdown while reserved">
        <MainPoolCardPreview attendance={createAttendanceWithReservedPayment()} user={user} />
      </StatePreview>

      <StatePreview label="Completion countdown while queued">
        <MainPoolCardPreview attendance={createAttendanceWithQueuedPayment()} user={user} />
      </StatePreview>

      <StatePreview label="Paid">
        <MainPoolCardPreview attendance={createAttendanceWithPaymentRecord("charged")} user={user} />
      </StatePreview>

      <StatePreview label="Payment reserved">
        <MainPoolCardPreview
          attendance={createAttendanceWithPaymentRecord("reserved")}
          user={user}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded">
        <MainPoolCardPreview attendance={createAttendanceWithPaymentRecord("refunded")} user={user} />
      </StatePreview>

      <StatePreview label="Paid, others are queued">
        <MainPoolCardPreview attendance={createAttendanceWithRegisteredPaymentRecord("charged")} user={user} />
      </StatePreview>

      <StatePreview label="Payment reserved, others are queued">
        <MainPoolCardPreview
          attendance={createAttendanceWithRegisteredPaymentRecord("reserved")}
          user={user}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded, others are queued">
        <MainPoolCardPreview attendance={createAttendanceWithRegisteredPaymentRecord("refunded")} user={user} />
      </StatePreview>

      <StatePreview label="Paid while queued">
        <MainPoolCardPreview attendance={createAttendanceWithQueuedPaymentRecord("charged")} user={user} />
      </StatePreview>

      <StatePreview label="Payment reserved while queued">
        <MainPoolCardPreview
          attendance={createAttendanceWithQueuedPaymentRecord("reserved")}
          user={user}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded while queued">
        <MainPoolCardPreview attendance={createAttendanceWithQueuedPaymentRecord("refunded")} user={user} />
      </StatePreview>

      <StatePreview label="Punishment delay">
        <MainPoolCardPreview attendance={createAttendanceWithServingPunishment()} user={user} />
      </StatePreview>

      <StatePreview label="Punishment delay with payment">
        <MainPoolCardPreview attendance={createAttendanceWithServingPunishment({ withPayment: true })} user={user} />
      </StatePreview>

      <StatePreview label="Selections pending">
        <MainPoolCardPreview attendance={createAttendanceWithSelectionsPending()} user={user} />
      </StatePreview>

      <StatePreview label="Selections complete">
        <MainPoolCardPreview attendance={createAttendanceWithSelectionsComplete()} user={user} />
      </StatePreview>

      <StatePreview label="Payment and selections pending">
        <MainPoolCardPreview attendance={createAttendanceWithPaymentAndSelectionsPending()} user={user} />
      </StatePreview>

      <StatePreview label="Payment complete, selections pending">
        <MainPoolCardPreview attendance={createAttendanceWithPaymentCompleteSelectionsPending()} user={user} />
      </StatePreview>

      <StatePreview label="Selections complete, payment pending">
        <MainPoolCardPreview attendance={createAttendanceWithSelectionsCompletePaymentPending()} user={user} />
      </StatePreview>

      <StatePreview label="Selections pending after deregister deadline">
        <MainPoolCardPreview attendance={createAttendanceWithSelectionsPendingPastDeregisterDeadline()} user={user} />
      </StatePreview>

      <StatePreview label="Payment and selections pending after deregister deadline">
        <MainPoolCardPreview
          attendance={createAttendanceWithPaymentAndSelectionsPendingPastDeregisterDeadline()}
          user={user}
        />
      </StatePreview>
    </div>
  )
}
