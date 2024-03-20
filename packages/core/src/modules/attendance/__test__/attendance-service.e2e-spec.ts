import { createEnvironment } from "@dotkomonline/env"
import { AttendancePoolWrite, AttendanceWrite, AttendeeWrite, EventWrite, UserWrite } from "@dotkomonline/types"
import crypto from "crypto"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { createServiceLayer, type ServiceLayer } from "../../core"
import { CantDeleteAttendanceError, AttendanceValidationError } from "../attendance-error"
import { AttendeeRegistrationError, AttendeeDeregistrationError } from "../attendee-error"
import { CantDeletePoolError, AttendancePoolValidationError } from "../attendance-pool-error"

const getFakeUser = (write: Partial<UserWrite>): UserWrite => ({
  auth0Sub: write.auth0Sub ?? crypto.randomUUID(),
  studyYear: write.studyYear ?? 1,
  email: write.email ?? "testuser@local.com",
  name: write.name ?? "Test User",
  lastSyncedAt: write.lastSyncedAt ?? new Date(),
})

const getFakeAttendance = (write: Partial<AttendanceWrite>): AttendanceWrite => ({
  deregisterDeadline: write.deregisterDeadline ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now by default
  mergeTime: write.mergeTime ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now by default
  registerEnd: write.registerEnd ?? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now by default
  registerStart: write.registerStart ?? new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday by default
})

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
  let cleanup: CleanupFunction

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "attendance")
    cleanup = context.cleanup
    core = await createServiceLayer({ db: context.kysely })
  })

  afterEach(async () => {
    await cleanup()
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

    const attendeesInPool = await core.attendeeService.getByAttendancePoolId(insertedPool.id)

    expect(attendeesInPool).toHaveLength(1)
  })

  // registerStart < mergeTime < registerEnd
  it("validates dates correctly before creating new attendance", async () => {
    const shouldFail = async (args: AttendanceWrite) => {
      const fakeAttendance = getFakeAttendance(args)
      await expect(async () => {
        await core.attendanceService.create(fakeAttendance)
      }).rejects.toThrowError(AttendanceValidationError)
    }

    // registerStart > mergeTime
    await shouldFail({
      mergeTime: new Date("2021-01-01"),
      registerStart: new Date("2021-01-02"),
      registerEnd: new Date("2021-01-03"),
      deregisterDeadline: new Date("2021-01-04"),
    })

    // registerEnd > registerEnd
    await shouldFail({
      mergeTime: new Date("2021-01-01"),
      registerEnd: new Date("2021-01-02"),
      registerStart: new Date("2021-01-03"),
      deregisterDeadline: new Date("2021-01-04"),
    })

    // mergeTime > registerEnd
    await shouldFail({
      registerStart: new Date("2021-01-01"),
      registerEnd: new Date("2021-01-02"),
      mergeTime: new Date("2021-01-03"),
      deregisterDeadline: new Date("2021-01-04"),
    })
  })

  it("should not allow registrations beyond pool capacity", async () => {
    const { users, pools } = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ limit: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    // attend user 1 to pool
    await core.attendeeService.registerForEvent(users[0].id, pool.attendanceId, new Date())

    // attend user 2 to pool
    await expect(async () => {
      await core.attendeeService.registerForEvent(users[1].id, pool.attendanceId, new Date())
    }).rejects.toThrowError(AttendeeRegistrationError)
  })

  // it should not allow creating pools with over lapping year criteria
  it("should not allow creating pools with overlapping year criteria", async () => {
    await expect(async () => {
      await setupFakeFullAttendance(core, {
        attendance: {},
        pools: [
          { limit: 1, yearCriteria: [1, 2] },
          { limit: 1, yearCriteria: [2, 3] },
        ],
        users: [],
      })
    }).rejects.toThrowError(AttendancePoolValidationError)
  })

  it("should not allow deleting a pool or attendance when there is attendees", async () => {
    const res = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ yearCriteria: [1, 3] }],
      users: [{ studyYear: 1 }, { studyYear: 3 }],
    })

    const user = res.users[0]

    const attendee = await core.attendeeService.registerForEvent(user.id, res.attendance.id, new Date())

    expect(attendee).not.toBeNull()

    const pool = res.pools[0]
    await expect(async () => {
      await core.attendancePoolService.delete(pool.id)
    }).rejects.toThrowError(CantDeletePoolError)

    await expect(async () => {
      await core.attendanceService.delete(res.attendance.id)
    }).rejects.toThrowError(CantDeleteAttendanceError)
  })

  it("should enforce registration and deregistration within specified start and end times", async () => {
    const start = new Date("2021-01-02")
    const mergeTime = new Date("2021-01-03")
    const deregisterDeadline = new Date("2021-01-04")
    const end = new Date("2021-01-05")

    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: { registerStart: start, registerEnd: end, deregisterDeadline, mergeTime },
      pools: [{ limit: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    const user = users[0]

    // --- registration
    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-01"))
    }).rejects.toThrowError(AttendeeRegistrationError)

    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-06"))
    }).rejects.toThrowError(AttendeeRegistrationError)

    // --- deregistration
    const attendee = await core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date("2021-01-03"))
    await expect(() => {
      return core.attendeeService.deregisterForEvent(attendee.id, new Date("2021-01-05"))
    }).rejects.toThrowError(AttendeeDeregistrationError)
  })

  it("simulates a normal attendance with all cases", async () => {
    // Step 1: Setup the attendance with multiple pools and varying year criteria
    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: {
        registerStart: new Date("2021-01-01"),
        registerEnd: new Date("2021-01-07"),
        deregisterDeadline: new Date("2021-01-05"),
        mergeTime: new Date("2021-01-06"),
      },
      pools: [
        { limit: 2, yearCriteria: [1] }, // Pool for 1st-year students
        { limit: 2, yearCriteria: [2] }, // Pool for 2nd-year students
        { limit: 2, yearCriteria: [3, 4] }, // Pool for 3rd and 4th-year students
      ],
      users: [
        { studyYear: 1 }, // User in 1st year
        { studyYear: 1 }, // Another user in 1st year
        { studyYear: 2 }, // User in 2nd year
        { studyYear: 3 }, // User in 3rd year
      ],
    })

    // Step 2: Register each user to the event and verify successful registration
    for (const user of users) {
      const registrationDate = new Date("2021-01-02")
      const attendee = await core.attendeeService.registerForEvent(user.id, attendance.id, registrationDate)
      expect(attendee).not.toBeNull()
    }

    // Step 3: Attempt to register a user beyond pool capacity and expect failure
    const extraUser = getFakeUser({ studyYear: 1 })
    const extraUserCreated = await core.userService.createUser(extraUser)
    await expect(
      core.attendeeService.registerForEvent(extraUserCreated.id, attendance.id, new Date("2021-01-02"))
    ).rejects.toThrowError(AttendeeRegistrationError)

    // Step 4: Deregister a user before the deadline and verify
    const attendeeToDeregister = await core.attendeeService.getByUserId(users[0].id, attendance.id)
    if (attendeeToDeregister === null) throw new Error("Attendee not found")
    await expect(
      core.attendeeService.deregisterForEvent(attendeeToDeregister.id, new Date("2021-01-04"))
    ).resolves.not.toThrowError(AttendeeDeregistrationError)

    // Step 5: Attempt to deregister a user after the deadline and expect failure
    const attendeeToDeregisterLate = await core.attendeeService.getByUserId(users[1].id, attendance.id)
    if (attendeeToDeregisterLate === null) throw new Error("Attendee not found")
    await expect(
      core.attendeeService.deregisterForEvent(attendeeToDeregisterLate.id, new Date("2021-01-06"))
    ).rejects.toThrowError(AttendeeDeregistrationError)

    // Step 6: Verify pool merging logic (if applicable)
  })

  it("should correctly manage registrations for social membership pool", async () => {
    // At this time there is no specific logic for social membership pools
    const { pools, users } = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ limit: 1, yearCriteria: [0] }],
      users: [{ studyYear: 0 }],
    })

    const pool = pools[0]
    const user = users[0]

    const attendee = await core.attendeeService.registerForEvent(user.id, pool.attendanceId, new Date())

    expect(attendee).not.toBeNull()
  })

  // TODO: not yet implemented in service.
  it.skip("should correctly handle pool merging at the specified merge time", async () => {})
})
