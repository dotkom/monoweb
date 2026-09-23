import { Text } from "@dotkomonline/ui"
import { addDays } from "date-fns"
import { useEffect, useState, type ReactNode } from "react"
import {
  createAttendanceOpeningSoon,
  createAttendanceOpeningSoonWithPrice,
  createAttendanceWithPaymentCountdown,
  createAttendanceWithPaymentRecord,
  createAttendanceWithQueue,
  createAttendanceWithQueuedPayment,
  createAttendanceWithQueuedPaymentRecord,
  createAttendanceWithReservedPayment,
  createAttendanceWithReservedPaymentRecord,
  createAttendanceWithReservedUser,
  createAttendanceWithServingPunishment,
  createIneligiblePoolAttendance,
  createMockAttendance,
  createMockAttendee,
  createMockUser,
} from "../../../../../.ladle/fixtures/attendance"
import { MainPoolCard } from "./MainPoolCard"

const AUTHORIZE_URL = "/api/auth/login"
const SIMULATION_CAPACITY = 120

// The goal is to make the registration go very fast at the start, and then slows down as the pool fills up
const getTickDelayMs = (reservedCount: number): number => {
  if (reservedCount < 50) {
    return 100 // 10/s
  }

  if (reservedCount < 102) {
    return 200
  }

  if (reservedCount < 111) {
    return 1000
  }

  return 3000
}

export const ActiveRegistration = () => {
  const [reservedCount, setReservedCount] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReservedCount((current) => (current >= SIMULATION_CAPACITY ? 0 : current + 1))
    }, getTickDelayMs(reservedCount))

    return () => clearTimeout(timeout)
  }, [reservedCount])

  // After 20 "registrations", 1 of 3 new registrations have an accompanying waitlist/queue entry
  const queuedCount = reservedCount < 20 ? 0 : Math.floor((reservedCount - 20) / 3)
  const attendees = [
    ...Array.from({ length: reservedCount }, () => createMockAttendee({ reserved: true })),
    ...Array.from({ length: queuedCount }, () => createMockAttendee({ reserved: false })),
  ]

  const attendance = createMockAttendance({ capacity: SIMULATION_CAPACITY, attendees })
  const viewer = createMockUser({ id: "00000000-0000-4000-8000-000000000999" })

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <Text className="text-sm text-muted-foreground">Aktiv påmelding</Text>
      <MainPoolCard attendance={attendance} user={viewer} authorizeUrl={AUTHORIZE_URL} />
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
        <MainPoolCard
          attendance={createMockAttendance({ attendancePrice: 100 })}
          user={null}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="No membership">
        <MainPoolCard
          attendance={createMockAttendance({ attendancePrice: 100 })}
          user={createMockUser({ memberships: [] })}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Ineligible pool">
        <MainPoolCard attendance={createIneligiblePoolAttendance()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Not registered">
        <MainPoolCard attendance={createMockAttendance()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Not registered, others are queued">
        <MainPoolCard
          attendance={createAttendanceWithQueue({
            capacity: 2,
            reservedOtherCount: 2,
            queuedOtherCount: 3,
            viewer: "absent",
          })}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Reserved">
        <MainPoolCard attendance={createAttendanceWithReservedUser()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Reserved, others are queued">
        <MainPoolCard
          attendance={createAttendanceWithQueue({
            capacity: 2,
            reservedOtherCount: 1,
            queuedOtherCount: 2,
            viewer: "reserved",
          })}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="In queue">
        <MainPoolCard
          attendance={createAttendanceWithQueue({
            capacity: 2,
            reservedOtherCount: 2,
            queuedOtherCount: 2,
            viewer: "queued",
            viewerQueuePosition: 2,
          })}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Register countdown">
        <MainPoolCard attendance={createAttendanceOpeningSoon()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Register countdown with price">
        <MainPoolCard attendance={createAttendanceOpeningSoonWithPrice()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Payment countdown">
        <MainPoolCard attendance={createAttendanceWithPaymentCountdown()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Payment countdown while reserved">
        <MainPoolCard attendance={createAttendanceWithReservedPayment()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Payment countdown while queued">
        <MainPoolCard attendance={createAttendanceWithQueuedPayment()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Paid">
        <MainPoolCard
          attendance={createAttendanceWithPaymentRecord("charged")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Payment reserved">
        <MainPoolCard
          attendance={createAttendanceWithPaymentRecord("reserved")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded">
        <MainPoolCard
          attendance={createAttendanceWithPaymentRecord("refunded")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Paid, others are queued">
        <MainPoolCard
          attendance={createAttendanceWithReservedPaymentRecord("charged")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Payment reserved, others are queued">
        <MainPoolCard
          attendance={createAttendanceWithReservedPaymentRecord("reserved")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded, others are queued">
        <MainPoolCard
          attendance={createAttendanceWithReservedPaymentRecord("refunded")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Paid while queued">
        <MainPoolCard
          attendance={createAttendanceWithQueuedPaymentRecord("charged")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Payment reserved while queued">
        <MainPoolCard
          attendance={createAttendanceWithQueuedPaymentRecord("reserved")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
          chargeScheduleDate={chargeScheduleDate}
        />
      </StatePreview>

      <StatePreview label="Refunded while queued">
        <MainPoolCard
          attendance={createAttendanceWithQueuedPaymentRecord("refunded")}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>

      <StatePreview label="Punishment delay">
        <MainPoolCard attendance={createAttendanceWithServingPunishment()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </StatePreview>

      <StatePreview label="Punishment delay with payment">
        <MainPoolCard
          attendance={createAttendanceWithServingPunishment({ withPayment: true })}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </StatePreview>
    </div>
  )
}
