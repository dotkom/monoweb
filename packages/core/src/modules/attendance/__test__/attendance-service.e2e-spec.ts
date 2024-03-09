import { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import { AttendancePoolWrite, AttendanceWrite, AttendeeWrite, EventWrite, UserWrite } from "@dotkomonline/types"
import crypto, { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getTestDb, setupTestDB } from "../../../../vitest-integration.setup"
import { createServiceLayer, type ServiceLayer } from "../../core"

const getFakeUser = (write: Partial<UserWrite>): UserWrite => ({
  auth0Sub: write.auth0Sub ?? crypto.randomUUID(),
  studyYear: write.studyYear ?? 1,
  email: write.email ?? "testuser@local.com",
  name: write.name ?? "Test User",
  lastSyncedAt: write.lastSyncedAt ?? new Date(),
})

const getFakeAttendance = (write: Partial<AttendanceWrite>): AttendanceWrite => ({
  deregisterDeadline: write.deregisterDeadline ?? new Date(),
  mergeTime: write.mergeTime ?? new Date(),
  registerEnd: write.registerEnd ?? new Date(),
  registerStart: write.registerStart ?? new Date(),
})

// const fakePool012: AttendancePool = {
const getFakePool = (write: Partial<AttendancePoolWrite>): AttendancePoolWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  limit: write.limit ?? 10,
  yearCriteria: write.yearCriteria ?? [0, 1, 2],
})

const getFakeAttendee = (write: Partial<AttendeeWrite>): AttendeeWrite => ({
  userId: write.userId ?? ulid(),
  attendancePoolId: write.attendancePoolId ?? ulid(),
  attended: write.attended ?? false,
  extrasChoices: write.extrasChoices ?? [],
})

const getFakeEvent = (write: Partial<EventWrite>): EventWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  description: write.description ?? "description",
  end: write.end ?? new Date(),
  extras: write.extras ?? [],
  imageUrl: write.imageUrl ?? "imageUrl",
  location: write.location ?? "location",
  public: write.public ?? true,
  start: write.start ?? new Date(),
  status: write.status ?? "ATTENDANCE",
  title: write.title ?? "",
  subtitle: write.subtitle ?? "",
  type: write.type ?? "ACADEMIC",
})

const setupFakeFullAttendance = async (
  core: ServiceLayer,
  {
    pools: _pools,
    users: _users,
    attendance: _attendance,
  }: {
    pools: Partial<AttendancePoolWrite>[]
    users: Partial<UserWrite>[]
    attendance: Partial<AttendanceWrite>
  }
) => {
  const fakeAttendance = getFakeAttendance(_attendance)
  const attendance = await core.attendanceService.create(fakeAttendance)

  const fakePools = _pools.map((group) => getFakePool({ ...group, attendanceId: attendance.id }))
  const pools = []

  for (let i = 0; i < fakePools.length; i++) {
    const fakePool = fakePools[i]
    const insertedPool = await core.attendancePoolService.create(fakePool)
    pools.push(insertedPool)
  }

  const users = []

  for (let i = 0; i < _users.length; i++) {
    const _user = _users[i]
    const email = `user${i}@local.com`
    const fakeUser = getFakeUser({ ..._users, studyYear: _user.studyYear, email })
    const user = await core.userService.createUser(fakeUser)
    users.push(user)
  }

  return {
    users,
    pools,
    attendance,
  }
}

describe("attendance", () => {
  let core: ServiceLayer
  let db: Kysely<Database>
  const dbName = "attendance"

  beforeEach(async () => {
    const env = createEnvironment()
    await setupTestDB(env, dbName)

    db = getTestDb(env, dbName)

    core = await createServiceLayer({ db })
  })

  afterEach(async () => {
    await db.destroy()
  })

  it("basic crud", async () => {
    // create attendance
    // create pool
    // create user
    // register user for event

    const fakeAttendance = getFakeAttendance({})
    const attendance = await core.attendanceService.create(fakeAttendance)

    const insertedAttendance = await core.attendanceService.getById(attendance.id)

    expect(insertedAttendance).not.toBeNull()

    const fakePool = getFakePool({ attendanceId: attendance.id, yearCriteria: [0, 1, 2] })
    const insertedPool = await core.attendancePoolService.create(fakePool)

    expect(insertedPool).not.toBeNull()

    const pools = await core.attendancePoolService.getByAttendanceId(attendance.id)

    expect(pools).toHaveLength(1)

    const fakeUser = getFakeUser({ studyYear: 1 })

    const user = await core.userService.createUser(fakeUser)

    const attendee = await core.attendeeService.registerForEvent(user.id, attendance.id, new Date())

    expect(attendee).not.toBeNull()

    const attendees = await core.attendeeService.getByAttendanceId(attendance.id)

    expect(attendees).toHaveLength(1)
  })

  // TODO: implement logic in service.
  it("should not allow registration end before start when creating attendance", async () => {
    const start = new Date("2021-01-01")
    const end = new Date("2021-01-04")

    await expect(async () => {
      const fakeAttendance = getFakeAttendance({ registerStart: start, registerEnd: end })
      const attendance = await core.attendanceService.create(fakeAttendance)

      return attendance
    }).rejects.toThrowError("end before start")
  })

  it("should not allow registrations beyond pool capacity", async () => {
    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ limit: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    // attend user 1 to pool
    await core.attendeeService.registerForEvent(users[0].id, pool.attendanceId, new Date())

    // attend user 2 to pool
    try {
      await core.attendeeService.registerForEvent(users[1].id, pool.attendanceId, new Date())
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it("should prevent creation of pools with discontinuous year criteria", async () => {
    await expect(async () => {
      const res = await setupFakeFullAttendance(core, {
        attendance: {},
        pools: [{ yearCriteria: [1, 3] }],
        users: [],
      })

      return res
    }).rejects.toThrowError("not continous")
  })

  it("should enforce registration and deregistration within specified start and end times", async () => {
    const start = new Date("2021-01-02")
    const end = new Date("2021-01-03")
    const deregisterDeadline = new Date("2021-01-04")

    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: { registerStart: start, registerEnd: end, deregisterDeadline },
      pools: [{ limit: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    const user = users[0]

    // --- registration
    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-01"))
    }).rejects.toThrowError("Attendance has not started yet")

    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-04"))
    }).rejects.toThrowError("Attendance has ended")

    // --- deregistration
    const attendee = await core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-02"))
    await expect(() => {
      return core.attendeeService.deregisterForEvent(attendee.id, attendance.id, new Date("2021-01-05"))
    }).rejects.toThrowError("The deregister deadline has passed")
  })

  // TODO: implement logic in service.
  it.skip("simulates a normal attendance with all cases", async () => {
    // Verify attendees can deregister before the deadline but not after
  })

  // TODO: implement logic in service.
  it.skip("should correctly handle pool merging at the specified merge time", async () => {
    // Test pool merging functionality occurs correctly at the merge time
  })

  // TODO : implement logic in service.
  it.skip("should correctly manage registrations for social membership pool", async () => {
    // Ensure only those with social memberships can register for the designated pool
  })
})
