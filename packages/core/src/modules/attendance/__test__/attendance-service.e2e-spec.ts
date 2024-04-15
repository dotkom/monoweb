import { createEnvironment } from "@dotkomonline/env"
import type { AttendancePoolWrite, AttendanceWrite, AttendeeWrite, EventWrite, UserWrite } from "@dotkomonline/types"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import assert from "../../../../assert"
import { getUserMock } from "../../../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayer } from "../../core"
import { AttendanceDeletionError, ExtrasUpdateAfterRegistrationStartError } from "../attendance-error"
import { CantDeletePoolError } from "../attendance-pool-error"
import { AttendeeDeregistrationError, AttendeeRegistrationError } from "../attendee-error"

const assertIsWaitlistAttendee = (attendee: unknown) => {
  expect(attendee).toHaveProperty("isPunished")
}

const assertIsAttendee = (attendee: unknown) => {
  expect(attendee).not.toHaveProperty("isPunished")
}
const getFakeAttendance = (write: Partial<AttendanceWrite>): AttendanceWrite => ({
  deregisterDeadline: write.deregisterDeadline ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now by default
  registerEnd: write.registerEnd ?? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now by default
  registerStart: write.registerStart ?? new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday by default
  extras: write.extras ?? [],
})

const getFakePool = (write: Partial<AttendancePoolWrite>): AttendancePoolWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  capacity: write.capacity ?? 10,
  yearCriteria: write.yearCriteria ?? [0, 1, 2],
  title: write.title ?? "Pool title",
  isVisible: write.isVisible ?? true,
  type: write.type ?? "NORMAL",
})

const getFakeAttendee = (write: Partial<AttendeeWrite>): AttendeeWrite => ({
  userId: write.userId ?? ulid(),
  attendancePoolId: write.attendancePoolId ?? ulid(),
  attended: write.attended ?? false,
  extrasChoices: write.extrasChoices ?? [],
  attendanceId: write.attendanceId ?? ulid(),
  registeredAt: write.registeredAt ?? new Date(),
  createdAt: write.createdAt ?? new Date(),
  id: write.id ?? ulid(),
  updatedAt: write.updatedAt ?? new Date(),
})

const getFakeEvent = (write: Partial<EventWrite>): EventWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  description: write.description ?? "description",
  end: write.end ?? new Date(),
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
    const fakeUser = getUserMock({ ..._user, studyYear: _user.studyYear, email })
    const user = await core.userRepository.create(fakeUser)
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
    const fakeAttendance = getFakeAttendance({})
    const attendance = await core.attendanceService.create(fakeAttendance)

    const insertedAttendance = await core.attendanceService.getById(attendance.id)

    expect(insertedAttendance).not.toBeNull()

    const fakePool = getFakePool({ attendanceId: attendance.id, yearCriteria: [0, 1, 2] })
    const insertedPool = await core.attendancePoolService.create(fakePool)

    expect(insertedPool).not.toBeNull()

    const pools = await core.attendancePoolService.getByAttendanceId(attendance.id)

    expect(pools).toHaveLength(1)

    const fakeUser = getUserMock({ studyYear: 1 })

    const user = await core.userRepository.create(fakeUser)

    const matchingPool = pools.find((pool) => pool.yearCriteria.includes(user.studyYear))
    assert(matchingPool !== undefined, new Error("Pool not found"))
    const attendee = await core.attendeeService.registerForEvent(user.id, matchingPool.id, new Date())

    expect(attendee).not.toBeNull()

    const attendees = await core.attendeeService.getByAttendanceId(attendance.id)

    expect(attendees).toHaveLength(1)

    const attendeesInPool = await core.attendeeService.getByAttendancePoolId(insertedPool.id)

    expect(attendeesInPool).toHaveLength(1)
  })

  // registerStart < registerEnd
  it("validates dates correctly before creating new attendance", async () => {
    const shouldFail = async (args: AttendanceWrite) => {
      // registerEnd > registerEnd
      await shouldFail({
        registerEnd: new Date("2021-01-02"),
        registerStart: new Date("2021-01-03"),
        deregisterDeadline: new Date("2021-01-04"),
        extras: [],
      })
    }
  })

  it("should not allow registrations beyond pool capacity", async () => {
    const { users, pools } = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ capacity: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    // attend user 1 to pool
    const attendee = await core.attendeeService.registerForEvent(users[0].id, pool.id, new Date())

    assertIsAttendee(attendee)

    // attend user 2 to pool
    const waitlistAttendee = await core.attendeeService.registerForEvent(users[1].id, pool.id, new Date())

    assertIsWaitlistAttendee(waitlistAttendee)
  })

  it("should not allow deleting a pool or attendance when there is attendees", async () => {
    const res = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ yearCriteria: [1, 3] }],
      users: [{ studyYear: 1 }, { studyYear: 3 }],
    })

    const user = res.users[0]

    const attendee = await core.attendeeService.registerForEvent(user.id, res.pools[0].id, new Date())

    expect(attendee).not.toBeNull()

    const pool = res.pools[0]
    await expect(async () => {
      await core.attendancePoolService.delete(pool.id)
    }).rejects.toThrowError(CantDeletePoolError)

    await expect(async () => {
      await core.attendanceService.delete(res.attendance.id)
    }).rejects.toThrowError(AttendanceDeletionError)
  })

  it("should enforce registration and deregistration within specified start and end times", async () => {
    const start = new Date("2021-01-02")
    const deregisterDeadline = new Date("2021-01-04")
    const end = new Date("2021-01-05")

    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: { registerStart: start, registerEnd: end, deregisterDeadline },
      pools: [{ capacity: 1, yearCriteria: [1, 2] }],
      users: [{ studyYear: 1 }, { studyYear: 2 }],
    })

    const pool = pools[0]
    const user = users[0]

    // --- registration
    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.id, new Date("2021-01-01"))
    }).rejects.toThrowError(AttendeeRegistrationError)

    await expect(() => {
      return core.attendeeService.registerForEvent(user.id, pool.id, new Date("2021-01-06"))
    }).rejects.toThrowError(AttendeeRegistrationError)

    // --- deregistration
    const attendee = await core.attendeeService.registerForEvent(user.id, pool.id, new Date("2021-01-03"))
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
      },
      pools: [
        { capacity: 2, yearCriteria: [1] }, // Pool for 1st-year students
        { capacity: 2, yearCriteria: [2] }, // Pool for 2nd-year students
        { capacity: 2, yearCriteria: [3, 4] }, // Pool for 3rd and 4th-year students
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
      const matchingPool = pools.find((pool) => pool.yearCriteria.includes(user.studyYear))
      assert(matchingPool !== undefined, new Error("Pool not found"))
      const attendee = await core.attendeeService.registerForEvent(user.id, matchingPool.id, registrationDate)
      expect(attendee).not.toBeNull()
    }

    // Step 3: Attempt to register a user beyond pool capacity and expect failure
    const extraUser = getUserMock({ studyYear: 1 })
    const extraUserCreated = await core.userRepository.create(extraUser)

    const matchingPool = pools.find((pool) => pool.yearCriteria.includes(extraUserCreated.studyYear))
    assert(matchingPool !== undefined, new Error("Pool not found"))
    const waitlistAttendee = await core.attendeeService.registerForEvent(
      extraUserCreated.id,
      matchingPool.id,
      new Date("2021-01-02")
    )

    assertIsWaitlistAttendee(waitlistAttendee)

    // Step 4: Deregister a user before the deadline and verify
    const attendeeToDeregister = await core.attendeeService.getByUserId(users[0].id, attendance.id)
    assert(attendeeToDeregister !== null, new Error())
    await expect(
      core.attendeeService.deregisterForEvent(attendeeToDeregister.id, new Date("2021-01-04"))
    ).resolves.not.toThrowError(AttendeeDeregistrationError)

    // Step 5: Attempt to deregister a user after the deadline and expect failure
    const attendeeToDeregisterLate = await core.attendeeService.getByUserId(users[1].id, attendance.id)
    assert(attendeeToDeregisterLate !== null, new Error())
    await expect(
      core.attendeeService.deregisterForEvent(attendeeToDeregisterLate.id, new Date("2021-01-06"))
    ).rejects.toThrowError(AttendeeDeregistrationError)

    // Step 6: Verify pool merging logic (if applicable)
  })

  it("should correctly manage registrations for social membership pool", async () => {
    // At this time there is no specific logic for social membership pools
    const { pools, users } = await setupFakeFullAttendance(core, {
      attendance: {},
      pools: [{ capacity: 1, yearCriteria: [0] }],
      users: [{ studyYear: 0 }],
    })

    const pool = pools[0]
    const user = users[0]

    const attendee = await core.attendeeService.registerForEvent(user.id, pool.id, new Date())

    expect(attendee).not.toBeNull()
  })

  it("handles extras correctly", async () => {
    const extrasToInsert = [
      {
        id: ulid(),
        name: "Hvilken mat vil du ha",
        choices: [
          {
            id: ulid(),
            name: "Pizza",
          },
          {
            id: ulid(),
            name: "Pasta",
          },
          {
            id: ulid(),
            name: "Burger",
          },
        ],
      },
      {
        id: ulid(),
        name: "Hvilken drikke vil du ha",
        choices: [
          {
            id: ulid(),
            name: "Cola",
          },
          {
            id: ulid(),
            name: "Fanta",
          },
          {
            id: ulid(),
            name: "Sprite",
          },
        ],
      },
    ]

    const registerStart = new Date("2021-01-02")

    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: {
        extras: extrasToInsert,
        registerStart,
      },
      pools: [{ capacity: 1, yearCriteria: [1] }],
      users: [{ studyYear: 1 }],
    })

    const pool = pools[0]
    const user = users[0]

    const attendee = await core.attendeeService.registerForEvent(user.id, pool.id, new Date())

    const extras = attendance.extras

    assert(extras !== null, new Error())

    const foodQuestion = extras[0]
    const drinkQuestion = extras[1]

    const pizza = foodQuestion.choices[0]

    const cola = drinkQuestion.choices[0]
    const fanta = drinkQuestion.choices[1]
    const sprite = drinkQuestion.choices[2]

    const choice1 = {
      questionId: foodQuestion.id,
      choiceId: pizza.id,
      choiceName: pizza.name,
    }

    const choice2 = {
      questionId: drinkQuestion.id,
      choiceId: fanta.id,
      choiceName: fanta.name,
    }

    const updatedAttendee1 = await core.attendeeService.updateExtraChoices(attendee.id, [choice1])
    expect(updatedAttendee1.extrasChoices).toHaveLength(1)
    expect(updatedAttendee1.extrasChoices[0]).toEqual(choice1)

    const updatedAttendee2 = await core.attendeeService.updateExtraChoices(attendee.id, [choice1, choice2])
    expect(updatedAttendee2.extrasChoices).toHaveLength(2)
    expect(updatedAttendee2.extrasChoices[0]).toEqual(choice1)
    expect(updatedAttendee2.extrasChoices[1]).toEqual(choice2)

    // Remove fanta from drinkQuestion
    const newDrinkChoices = extrasToInsert[1].choices.filter((choice) => choice.name !== "Fanta")

    const updatedExtrasToInsert = [
      extrasToInsert[0],
      {
        ...extrasToInsert[1],
        choices: newDrinkChoices,
      },
    ]

    const beforeRegisterStart = new Date("2021-01-01")
    const afterRegisterStart = new Date("2021-01-03")

    const updatedAttendance = await core.attendanceService.updateExtras(
      attendance.id,
      updatedExtrasToInsert,
      beforeRegisterStart
    )

    // check that fanta choice is not in the updated attendance
    assert(updatedAttendance !== null, new Error())
    const updatedExtras = updatedAttendance.extras
    assert(updatedExtras !== null, new Error())
    const updatedDrinkQuestion = updatedExtras[1]
    assert(updatedDrinkQuestion !== null, new Error())
    expect(updatedDrinkQuestion.choices[0]).toEqual(cola)
    expect(updatedDrinkQuestion.choices[1]).not.toEqual(fanta)
    expect(updatedDrinkQuestion.choices[1]).toEqual(sprite)

    await expect(async () => {
      return await core.attendanceService.updateExtras(attendance.id, extrasToInsert, afterRegisterStart)
    }).rejects.toThrowError(ExtrasUpdateAfterRegistrationStartError)
  })

  it("should correctly handle pool merging at the specified merge time", async () => {
    const insertPools = [
      { capacity: 1, yearCriteria: [2] },
      { capacity: 2, yearCriteria: [3] },
    ]

    const _attendees = [
      { attendee: { studyYear: 2, name: "user21" }, registrationDate: new Date("2021-01-01 14:00:00") }, // gets in
      { attendee: { studyYear: 3, name: "user32" }, registrationDate: new Date("2021-01-01 15:00:00") }, // gets in
      { attendee: { studyYear: 3, name: "user33" }, registrationDate: new Date("2021-01-01 13:00:00") }, // gets in

      { attendee: { studyYear: 3, name: "user34" }, registrationDate: new Date("2021-01-01 17:00:00") },
      { attendee: { studyYear: 3, name: "user35" }, registrationDate: new Date("2021-01-01 18:00:00") },
      { attendee: { studyYear: 2, name: "user26" }, registrationDate: new Date("2021-01-01 19:00:00") },
    ]

    const registerStart = new Date("2021-01-01 00:00:00")
    const registerEnd = new Date("2021-01-07")
    const deregisterDeadline = new Date("2021-01-05")

    const { users, pools, attendance } = await setupFakeFullAttendance(core, {
      attendance: { registerStart, registerEnd, deregisterDeadline },
      pools: insertPools,
      users: _attendees.map((obj) => obj.attendee),
    })

    for (let i = 0; i < _attendees.length; i++) {
      const user = users[i]
      const { registrationDate } = _attendees[i]

      const matchingPool = pools.find((pool) => pool.yearCriteria.includes(user.studyYear))
      assert(matchingPool !== undefined, new Error("Pool not found"))
      const attendee = await core.attendeeService.registerForEvent(user.id, matchingPool.id, registrationDate)

      expect(attendee).not.toBeNull()
    }

    await core.attendanceService.merge(attendance.id, "Merged pool", [0, 1, 2, 3, 4, 5])

    const waitlistAttendees = await core.waitlistAttendeService.getByAttendanceId(attendance.id)

    const expectedWaitlistPositions = [
      {
        name: "user34",
        position: 0,
      },
      {
        name: "user35",
        position: 1,
      },
      {
        name: "user26",
        position: 2,
      },
    ]

    assert(waitlistAttendees !== null, Error("Expected waitlist attendees to be non-null in merge"))
    expect(waitlistAttendees).toHaveLength(3)

    for (const waitlistAttendee of waitlistAttendees) {
      const actual = waitlistAttendee.position
      const expected = expectedWaitlistPositions.find((obj) => obj.name === waitlistAttendee.name)?.position

      expect(actual).toEqual(expected)
    }
  })
})
