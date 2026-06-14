import { Text } from "@dotkomonline/ui"
import { useEffect, useState } from "react"
import {
  createAttendanceOpeningSoon,
  createAttendanceWithFullPool,
  createAttendanceWithPaymentCountdown,
  createAttendanceWithReservedUser,
  createAttendanceWithServingPunishment,
  createAttendanceWithWaitlistedUser,
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

export const AllStates = () => {
  const user = createMockUser()
  const reservedAttendance = createAttendanceWithReservedUser()
  const waitlistAttendance = createAttendanceWithWaitlistedUser()
  const waitlistWithQueueAttendance = createAttendanceWithWaitlistedUser(4)
  const fullAttendance = createAttendanceWithFullPool()
  const waitlistedAttendee = createAttendanceWithWaitlistedUser(1).attendees[0]
  const paymentAttendance = createAttendanceWithPaymentCountdown()
  const punishmentAttendance = createAttendanceWithServingPunishment()

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not logged in</Text>
        <MainPoolCard
          attendance={createMockAttendance({ attendancePrice: 100 })}
          user={null}
          authorizeUrl={AUTHORIZE_URL}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">No membership</Text>
        <MainPoolCard
          attendance={createMockAttendance({ attendancePrice: 100 })}
          user={createMockUser({ memberships: [] })}
          authorizeUrl={AUTHORIZE_URL}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Ineligible pool</Text>
        <MainPoolCard attendance={createIneligiblePoolAttendance()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not registered</Text>
        <MainPoolCard attendance={createMockAttendance()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Reserved</Text>
        <MainPoolCard
          attendance={reservedAttendance}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
          chargeScheduleDate={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Waitlist</Text>
        <MainPoolCard attendance={waitlistAttendance} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Waitlist with queue</Text>
        <MainPoolCard attendance={waitlistWithQueueAttendance} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Full pool with waitlist</Text>
        <MainPoolCard
          attendance={{
            ...fullAttendance,
            attendees: [...fullAttendance.attendees, waitlistedAttendee],
          }}
          user={user}
          authorizeUrl={AUTHORIZE_URL}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Register countdown</Text>
        <MainPoolCard attendance={createAttendanceOpeningSoon()} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Payment countdown</Text>
        <MainPoolCard attendance={paymentAttendance} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Serving punishment</Text>
        <MainPoolCard attendance={punishmentAttendance} user={user} authorizeUrl={AUTHORIZE_URL} />
      </div>
    </div>
  )
}
