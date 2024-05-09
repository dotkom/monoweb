import { randomUUID } from "node:crypto"
import { addHours } from "date-fns"
import { describe, vi } from "vitest"
import { AttendancePoolRepositoryImpl } from "../attendance-pool-repository"
import { AttendanceRepositoryImpl } from "../attendance-repository"
import { AttendanceServiceImpl } from "../attendance-service"
import { AttendeeRepositoryImpl } from "../attendee-repository"
import { WaitlistAttendeRepositoryImpl } from "../waitlist-attendee-repository"

describe("AttendanceService", () => {
  const attendanceRepository = vi.mocked(AttendanceRepositoryImpl.prototype)
  const attendeeRepository = vi.mocked(AttendeeRepositoryImpl.prototype)
  const waitlistAttendeeRepository = vi.mocked(WaitlistAttendeRepositoryImpl.prototype)
  const attendancePoolRepository = vi.mocked(AttendancePoolRepositoryImpl.prototype)

  const attendanceService = new AttendanceServiceImpl(
    attendanceRepository,
    attendeeRepository,
    waitlistAttendeeRepository,
    attendancePoolRepository
  )

  it("Sorts waitlist based on registeredAt when merging pools", async () => {
    const attendanceId = randomUUID()
    const pool1Id = randomUUID()
    const pool2Id = randomUUID()

    const baseDate = new Date("2021-01-01T00:00:00.000Z")

    const registeredAt = {
      user1: addHours(baseDate, 0),
      user2: addHours(baseDate, 1),
      user3: addHours(baseDate, 2),
      user4: addHours(baseDate, 3),
    }

    // POOL 1
    const user1 = {
      id: randomUUID(),
      name: "user 1",
      position: 0,
      registeredAt: registeredAt.user1,
      poolId: pool1Id,
    }

    // POOL 2

    const user3 = {
      id: randomUUID(),
      name: "user 3",
      position: 0, // NOTE: user3 is first in line in their pool because they have been bumped
      registeredAt: registeredAt.user3,
      poolId: pool2Id,
    }
    const user2 = {
      id: randomUUID(),
      name: "user 2",
      position: 1,
      registeredAt: registeredAt.user2,
      poolId: pool2Id,
    }

    // POOL 3
    const user4 = {
      id: randomUUID(),
      name: "user 4",
      position: 0,
      registeredAt: registeredAt.user4,
      poolId: randomUUID(),
    }

    // POOL1
    // waitlist: user1

    // POOL2
    // waitlist: user3, user2

    // POOL3
    // waitlist: user4

    const users = [user1, user4, user2, user3]

    vi.spyOn(waitlistAttendeeRepository, "getByAttendanceId").mockResolvedValueOnce(
      users.map((user) => ({
        id: user.id,
        userId: user.id,
        name: user.name,
        position: user.position,
        registeredAt: user.registeredAt,
        poolId: user.poolId,
        attendanceId: attendanceId,
        attendancePoolId: user.poolId,
        createdAt: new Date(),
        isPunished: false,
        studyYear: 1,
        updatedAt: new Date(),
      }))
    )

    const orderedWaitlist = await attendanceService.getAllWaitlistAttendeesOrdered(attendanceId)

    const expectedOrder = [user1.name, user2.name, user3.name, user4.name]

    expect(orderedWaitlist.map((attendee) => attendee.name)).toEqual(expectedOrder)
  })
})
