import { randomUUID } from "node:crypto"
import type { AttendancePoolWrite, AttendanceWrite, Attendee } from "./attendance"
import { type MembershipWrite, findActiveMembership } from "../user/user"
import { getCurrentUTC, getCurrentSemesterStart, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"
import { faker } from "@faker-js/faker"
import type { ApiResponse, GetUsers200ResponseOneOfInner } from "auth0"
import { addDays, addHours, addMilliseconds, addMinutes, isFuture, subHours } from "date-fns"
import invariant from "tiny-invariant"
import { describe, expect, it, vi } from "vitest"
import { auth0Client, core, dbClient } from "../../../vitest-integration.setup"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import { buildDeregistrationAvailabilityView, buildRegistrationAvailabilityView } from "./attendance-service"
import { getMockEvent, getMockGroup } from "./event.e2e-spec"

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockAttendance(input: Partial<AttendanceWrite> = {}): AttendanceWrite {
  return {
    registerStart: getCurrentUTC(),
    registerEnd: addHours(getCurrentUTC(), 12),
    deregisterDeadline: addDays(getCurrentUTC(), 2),
    selections: [],
    ...input,
  }
}

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockAttendancePool(input: Partial<AttendancePoolWrite> = {}): AttendancePoolWrite {
  return {
    title: faker.lorem.sentence(),
    mergeDelayHours: null,
    capacity: 10,
    yearCriteria: [1, 2, 3, 4, 5],
    ...input,
  }
}

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockMembership(input: Partial<MembershipWrite> = {}): MembershipWrite {
  return {
    type: "BACHELOR_STUDENT",
    start: getCurrentSemesterStart(),
    end: getNextSemesterStart(),
    specialization: null,
    semester: isSpringSemester() ? 1 : 0,
    ...input,
  }
}

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockAuth0UserResponse(subject: string): ApiResponse<GetUsers200ResponseOneOfInner> {
  return {
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    data: {
      user_id: subject,
      email: faker.internet.email(),
      email_verified: false,
      username: faker.internet.username(),
      phone_number: faker.phone.number(),
      phone_verified: false,
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      identities: [],
      app_metadata: {
        clientID: null,
        globalClientID: null,
        global_client_id: null,
        email_verified: null,
        user_id: null,
        identities: null,
        lastIP: null,
        lastLogin: null,
        metadata: null,
        created_at: null,
        loginsCount: null,
        _id: null,
        email: null,
        blocked: null,
        __tenant: null,
        updated_at: null,
      },
      user_metadata: {},
      picture: faker.image.avatar(),
      name: faker.person.fullName(),
      nickname: faker.person.firstName(),
      multifactor: [],
      last_ip: faker.internet.ip(),
      last_login: faker.date.recent(),
      logins_count: 1,
      blocked: false,
      given_name: faker.person.firstName(),
      family_name: faker.person.lastName(),
    },
  }
}

async function createUserWithMembership() {
  const subject = randomUUID()
  const userWithoutMembership = await core.userService.register(dbClient, subject)

  return await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
}

async function createAttendanceRegistrationContext(poolOverrides: Partial<AttendancePoolWrite> = {}) {
  auth0Client.users.get.mockImplementation(async ({ id }) => {
    return getMockAuth0UserResponse(id)
  })

  const event = await core.eventService.createEvent(dbClient, getMockEvent())
  const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
  await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)

  const pool = await core.attendanceService.createAttendancePool(
    dbClient,
    attendance.id,
    getMockAttendancePool({
      yearCriteria: [1],
      ...poolOverrides,
    })
  )
  const user = await createUserWithMembership()
  const options = {
    immediateReservation: false,
    immediatePayment: false,
    ignoreRegistrationWindow: false,
    overriddenAttendancePoolId: null,
    ignoreRegisteredToParent: false,
    overrideTurnstileCheck: true,
  }

  return { event, attendance, pool, user, options }
}

describe("attendance integration tests", async () => {
  it("should deny attendance with negative or less than 1 hour", async () => {
    await expect(() =>
      core.attendanceService.createAttendance(dbClient, {
        registerStart: getCurrentUTC(),
        // This is before the start time, which is invalid
        registerEnd: subHours(getCurrentUTC(), 1),
        deregisterDeadline: addHours(getCurrentUTC(), 2),
        selections: [],
      })
    ).rejects.toThrowError(InvalidArgumentError)
    await expect(() =>
      core.attendanceService.createAttendance(dbClient, {
        registerStart: getCurrentUTC(),
        // This is less than one hour
        registerEnd: addMinutes(getCurrentUTC(), 10),
        deregisterDeadline: addHours(getCurrentUTC(), 2),
        selections: [],
      })
    ).rejects.toThrowError(InvalidArgumentError)

    const registerStart = getCurrentUTC()
    const registerEnd = addHours(registerStart, 1)
    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerStart,
        registerEnd,
      })
    )

    expect(attendance).toMatchObject({ registerStart, registerEnd })
  })

  it("should validate attendance pool bounds on creation and update", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const invalidPoolOverrides: Partial<AttendancePoolWrite>[] = [
      { capacity: -1 },
      { mergeDelayHours: -1 },
      { mergeDelayHours: 97 },
      { yearCriteria: [0] },
      { yearCriteria: [6] },
    ]

    for (const overrides of invalidPoolOverrides) {
      const data = getMockAttendancePool({
        capacity: 0,
        yearCriteria: [2],
        ...overrides,
      })

      await expect(core.attendanceService.createAttendancePool(dbClient, attendance.id, data)).rejects.toThrow(
        InvalidArgumentError
      )
      await expect(core.attendanceService.updateAttendancePool(dbClient, pool.id, data)).rejects.toThrow(
        InvalidArgumentError
      )
    }

    for (const mergeDelayHours of [0, 96]) {
      const data = getMockAttendancePool({
        capacity: 0,
        mergeDelayHours,
        yearCriteria: [1, 5],
      })
      const updatedPool = await core.attendanceService.updateAttendancePool(dbClient, pool.id, data)

      expect(updatedPool).toMatchObject({ capacity: 0, mergeDelayHours, yearCriteria: [1, 5] })
    }
  })

  it("should prevent overlapping year constraints upon creation", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(dbClient, attendance.id, getMockAttendancePool())
    // This should break, because 1..=5 have been used already
    await expect(
      core.attendanceService.createAttendancePool(
        dbClient,
        attendance.id,
        getMockAttendancePool({
          yearCriteria: [1],
        })
      )
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("should prevent overlapping year constraints upon update", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1, 2, 3],
      })
    )
    // Breaks, because 3 is occupied by both pools in this plan
    await expect(
      core.attendanceService.createAttendancePool(
        dbClient,
        attendance.id,
        getMockAttendancePool({
          yearCriteria: [3, 4, 5],
        })
      )
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("should require unlimited capacity when pool has a merge delay", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())

    await expect(
      core.attendanceService.createAttendancePool(
        dbClient,
        attendance.id,
        getMockAttendancePool({
          mergeDelayHours: 24,
          capacity: 10,
        })
      )
    ).rejects.toThrow(InvalidArgumentError)

    await expect(
      core.attendanceService.createAttendancePool(
        dbClient,
        attendance.id,
        getMockAttendancePool({
          mergeDelayHours: 24,
          capacity: 0,
          yearCriteria: [1],
        })
      )
    ).resolves.toBeDefined()
  })

  it("should require unlimited capacity when updating a pool with a merge delay", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        capacity: 10,
        yearCriteria: [1],
      })
    )

    await expect(
      core.attendanceService.updateAttendancePool(
        dbClient,
        pool.id,
        getMockAttendancePool({
          mergeDelayHours: 24,
          capacity: 10,
          yearCriteria: [1],
        })
      )
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("should allow temporary overlap when updating", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1, 2, 3],
      })
    )
    // This should not break, because the overlap is temporary. [1, 2, 3] are not considered for the disjunction check
    await expect(
      core.attendanceService.updateAttendancePool(
        dbClient,
        pool.id,
        getMockAttendancePool({
          yearCriteria: [3, 4, 5],
        })
      )
    ).resolves.toBeDefined()
  })

  it("should fail to registrer if there is no applicable pool for a user", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()
    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "NO_MATCHING_POOL" })
  })

  it("should throw an error if the user has no active membership", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    const user = await core.userService.register(dbClient, subject)
    expect(findActiveMembership(user)).toBeNull()
    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "MISSING_MEMBERSHIP" })
  })

  it("should throw an error if the user is suspended", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const group = await core.groupService.create(dbClient, getMockGroup({ abbreviation: "Bedkom" }))
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)

    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )

    // Create a user and suspend them by giving them more than 6 marks.
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()
    const mark = await core.markService.create(
      dbClient,
      {
        type: "MANUAL",
        title: "Du har fått suspensjon",
        details: null,
        duration: 14,
        weight: 999,
      },
      [group.slug]
    )
    await core.personalMarkService.addToUser(dbClient, user.id, mark.id, user.id)
    const punishment = await core.personalMarkService.findPunishmentByUserId(dbClient, user.id)
    expect(punishment).toEqual(expect.objectContaining({ suspended: true }))

    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "SUSPENDED" })
  })

  it("should not allow registration outside of the registration window", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerStart: addDays(getCurrentUTC(), 1), // Registration starts tomorrow
        registerEnd: addDays(getCurrentUTC(), 2), // Registration ends in two days
      })
    )
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    // Attempt to registrer before the registration window opens
    const availability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }
    )
    expect(availability).toMatchObject({ success: false, eventCause: "TOO_EARLY", userCause: null })
    invariant(!availability.success && availability.userCause === null)
    expect(availability.pool).toBeDefined()
    // But bypassing the registration window, it should succeed
    const registration = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: true,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }
    )
    expect(registration.success).toBe(true)
    invariant(registration.success)

    const options = { ...registration.options, ignoreRegistrationWindow: false }

    try {
      for (const registrationTime of [attendance.registerStart, attendance.registerEnd]) {
        vi.setSystemTime(registrationTime)

        const boundaryAvailability = await core.attendanceService.getRegistrationAvailability(
          dbClient,
          attendance.id,
          null,
          user.id,
          options
        )

        expect(boundaryAvailability.success).toBe(true)
      }

      vi.setSystemTime(addMilliseconds(attendance.registerEnd, 1))

      const closedAvailability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        options
      )

      expect(closedAvailability).toMatchObject({ success: false, eventCause: "TOO_LATE", userCause: null })

      const overriddenAvailability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        { ...options, ignoreRegistrationWindow: true }
      )

      invariant(overriddenAvailability.success)

      const registrationEndBypasses = overriddenAvailability.bypassedChecks.filter((cause) => {
        return cause === "IGNORE_REGISTRATION_END"
      })

      expect(registrationEndBypasses).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it.each([
    { description: "pool delay", poolDelayHours: 4, markWeight: 0 },
    { description: "mark delay", poolDelayHours: null, markWeight: 2 },
    { description: "combined pool and mark delays", poolDelayHours: 3, markWeight: 1 },
  ])("should enforce the shortened registration deadline for $description", async ({ poolDelayHours, markWeight }) => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const registrationDeadline = getCurrentUTC()
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerStart: subHours(registrationDeadline, 20),
        registerEnd: addHours(registrationDeadline, 4),
      })
    )
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        mergeDelayHours: poolDelayHours,
        capacity: 0,
        yearCriteria: [1],
      })
    )

    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())

    if (markWeight > 0) {
      const group = await core.groupService.create(dbClient, getMockGroup())
      const mark = await core.markService.create(
        dbClient,
        {
          type: "MANUAL",
          title: "Utsatt påmelding",
          details: null,
          duration: 14,
          weight: markWeight,
        },
        [group.slug]
      )
      await core.personalMarkService.addToUser(dbClient, user.id, mark.id, user.id)
    }

    const options = {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    }

    try {
      vi.setSystemTime(registrationDeadline)

      const availability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        options
      )

      expect(availability).toMatchObject({ success: true, reservationActiveAt: attendance.registerEnd })

      vi.setSystemTime(addMilliseconds(registrationDeadline, 1))

      const closedAvailability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        options
      )

      expect(closedAvailability).toMatchObject({ success: false, eventCause: "TOO_LATE", userCause: null })

      const overriddenAvailability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        {
          ...options,
          ignoreRegistrationWindow: true,
        }
      )

      expect(overriddenAvailability).toMatchObject({
        success: true,
        bypassedChecks: expect.arrayContaining(["IGNORE_REGISTRATION_END"]),
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("should select the matching study year pool and reject an unknown pool override", async () => {
    const { attendance, user, options } = await createAttendanceRegistrationContext({ yearCriteria: [2] })
    const matchingPool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const availability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )

    expect(availability).toMatchObject({ success: true, pool: { id: matchingPool.id } })

    const invalidOverride = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      { ...options, overriddenAttendancePoolId: randomUUID() }
    )

    expect(invalidOverride).toMatchObject({ success: false, eventCause: null, userCause: "NO_MATCHING_POOL" })
  })

  it("should require a parent reservation unless explicitly overridden", async () => {
    const { event, attendance, user, options } = await createAttendanceRegistrationContext()
    const parentEvent = await core.eventService.createEvent(dbClient, getMockEvent())
    const parentAttendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, parentEvent.id, parentAttendance.id)
    await core.eventService.updateEventParent(dbClient, event.id, parentEvent.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      parentAttendance.id,
      getMockAttendancePool({
        capacity: 0,
        mergeDelayHours: 4,
        yearCriteria: [1],
      })
    )

    const missingParentRegistration = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )

    expect(missingParentRegistration).toMatchObject({ success: false, userCause: "MISSING_PARENT_REGISTRATION" })

    const overriddenAvailability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      { ...options, ignoreRegisteredToParent: true }
    )

    expect(overriddenAvailability).toMatchObject({
      success: true,
      bypassedChecks: expect.arrayContaining(["IGNORE_PARENT"]),
    })

    const parentAvailability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      parentAttendance.id,
      null,
      user.id,
      options
    )
    invariant(parentAvailability.success)

    const parentAttendee = await core.attendanceService.registerAttendee(dbClient, parentAvailability)

    expect(parentAttendee.registeredAt).toBeNull()

    const missingParentReservation = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )

    expect(missingParentReservation).toMatchObject({ success: false, userCause: "MISSING_PARENT_RESERVATION" })

    await core.attendanceService.updateAttendeeById(dbClient, parentAttendee.id, { registeredAt: getCurrentUTC() })

    const availability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )

    expect(availability.success).toBe(true)
  })

  it("should immediately reserve seats in a pool with unlimited capacity", async () => {
    const { attendance, options } = await createAttendanceRegistrationContext({ capacity: 0 })

    for (let attendeeIndex = 0; attendeeIndex < 2; attendeeIndex += 1) {
      const user = await createUserWithMembership()
      const availability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        user.id,
        options
      )
      invariant(availability.success)

      const attendee = await core.attendanceService.registerAttendee(dbClient, availability)

      expect(attendee.registeredAt).toBeInstanceOf(Date)
    }
  })

  it("should not allow registering twice for the same attendance", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    // Register the user for the attendance
    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    await core.attendanceService.registerAttendee(dbClient, result)

    // Attempt to registrer the same user again for the same attendance
    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: true,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "ALREADY_REGISTERED" })
  })

  it("should add a reservation time if the user has a punishment", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    // Create a mark that gives the user a reservation time
    const group = await core.groupService.create(dbClient, getMockGroup({ abbreviation: "Bedkom" }))
    const mark = await core.markService.create(
      dbClient,
      {
        type: "MANUAL",
        title: "Du har fått en reservasjonstid",
        details: null,
        duration: 14,
        weight: 1,
      },
      [group.slug]
    )
    await core.personalMarkService.addToUser(dbClient, user.id, mark.id, user.id)
    const punishment = await core.personalMarkService.findPunishmentByUserId(dbClient, user.id)
    expect(punishment).toEqual(expect.objectContaining({ delay: 1, suspended: false }))

    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)
    expect(attendee.userId).toEqual(user.id)
    expect(attendee.registrationEligibleAt).toSatisfy(isFuture)
    expect(attendee.registeredAt).toBeNull()
    expect(attendee.registrationMarkDelayHours).toBe(1)
    expect(attendee.registrationEligibleAt.getTime()).toBe(addHours(attendee.createdAt, 1).getTime())
  })

  it("should add a reservation time if the pool is a merge pool with delay", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerEnd: addHours(getCurrentUTC(), 48),
      })
    )
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        mergeDelayHours: 24,
        capacity: 0,
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)
    expect(attendee.userId).toEqual(user.id)
    expect(attendee.registrationEligibleAt).toSatisfy(isFuture)
    expect(attendee.registeredAt).toBeNull()
    expect(attendee.registrationPoolDelayHours).toBe(24)
    expect(attendee.registrationEligibleAt.getTime()).toBe(addHours(attendee.createdAt, 24).getTime())

    try {
      vi.setSystemTime(attendee.registrationEligibleAt)

      await core.attendanceService.executeReserveAttendeeTask(dbClient, {
        attendanceId: attendance.id,
        attendeeId: attendee.id,
      })

      const reservedAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

      expect(reservedAttendee.registeredAt).toEqual(attendee.registrationEligibleAt)

      vi.setSystemTime(addMinutes(attendee.registrationEligibleAt, 1))

      await core.attendanceService.executeReserveAttendeeTask(dbClient, {
        attendanceId: attendance.id,
        attendeeId: attendee.id,
      })

      const unchangedAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

      expect(unchangedAttendee.registeredAt).toEqual(reservedAttendee.registeredAt)
    } finally {
      vi.useRealTimers()
    }
  })

  it("should immediately reserve spots if immediateReservation=true", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)
    expect(attendee.registeredAt).not.toBeNull()
  })

  it("should deregister a queued attendee after the deadline", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)

    await core.attendanceService.updateAttendeeById(dbClient, attendee.id, {
      registeredAt: null,
    })

    await core.attendanceService.updateAttendanceById(dbClient, attendance.id, {
      deregisterDeadline: subHours(getCurrentUTC(), 1), // Set the deadline to one hour ago
    })
    await expect(
      core.attendanceService.deregisterAttendee(dbClient, attendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).resolves.toBeUndefined()
  })

  it("should prevent deregistration until a charged payment is refunded", async () => {
    const { attendance, user, options } = await createAttendanceRegistrationContext()
    const availability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )
    invariant(availability.success)

    const attendee = await core.attendanceService.registerAttendee(dbClient, availability)
    await dbClient.attendee.update({
      where: {
        id: attendee.id,
      },
      data: {
        paymentChargedAt: getCurrentUTC(),
      },
    })

    await expect(
      core.attendanceService.deregisterAttendee(dbClient, attendee.id, { ignoreDeregistrationWindow: true })
    ).rejects.toThrow(FailedPreconditionError)

    const chargedAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

    expect(chargedAttendee.paymentChargedAt).toBeInstanceOf(Date)

    await dbClient.attendee.update({
      where: {
        id: attendee.id,
      },
      data: {
        paymentRefundedAt: getCurrentUTC(),
      },
    })
    await core.attendanceService.deregisterAttendee(dbClient, attendee.id, { ignoreDeregistrationWindow: false })

    await expect(core.attendanceService.getAttendeeById(dbClient, attendee.id)).rejects.toThrow(NotFoundError)
  })

  it("should not deregister a registered attendee past the deadline", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)

    await core.attendanceService.updateAttendanceById(dbClient, attendance.id, {
      deregisterDeadline: subHours(getCurrentUTC(), 1), // Set the deadline to one hour ago
    })
    await expect(
      core.attendanceService.deregisterAttendee(dbClient, attendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).rejects.toThrow(FailedPreconditionError)
    // it should not be possible to deregister past the deadline with ignoreDeregistrationWindow=true
    await expect(
      core.attendanceService.deregisterAttendee(dbClient, attendee.id, {
        ignoreDeregistrationWindow: true,
      })
    ).resolves.toBeUndefined()
  })

  it("should always allow registering a user through admin despite not having an applicable pool", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerEnd: addHours(getCurrentUTC(), 48),
      })
    )
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    // We create an attendance pool that the user cannot attend, because they are not a 5th year student
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        mergeDelayHours: 24,
        capacity: 0,
        yearCriteria: [5],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    // If the user themselves attempt to registrer, it should fail because there is no applicable pool
    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "NO_MATCHING_POOL" })
    // But if an admin registers the user with an forceAttendancePoolId, it should succeed
    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: pool.id, // Force the user into the pool
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    console.log(result)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)

    expect(attendee.userId).toEqual(user.id)
    expect(attendee.registrationEligibleAt).toSatisfy(isFuture)
    expect(attendee.registeredAt).not.toBeNull()
  })

  it("should allow registering a user through admin even if they have no active membership", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const user = await core.userService.register(dbClient, subject)
    expect(findActiveMembership(user)).toBeNull()

    expect(
      await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      })
    ).toEqual({ success: false, eventCause: null, userCause: "MISSING_MEMBERSHIP" })

    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: true,
      overriddenAttendancePoolId: pool.id,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    expect(result.membership).toBeNull()
    expect(result.bypassedChecks).toContain("IGNORE_MEMBERSHIP")

    const attendee = await core.attendanceService.registerAttendee(dbClient, result)

    expect(attendee.userId).toEqual(user.id)
    expect(attendee.userGrade).toBeNull()
    expect(attendee.registeredAt).not.toBeNull()
  })

  it("should try to attend the next user in line after deregistering", async () => {
    const { attendance, user, options } = await createAttendanceRegistrationContext({ capacity: 1 })
    const availability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      options
    )
    invariant(availability.success)

    const registeredAttendee = await core.attendanceService.registerAttendee(dbClient, availability)
    const queuedAttendees: Attendee[] = []

    expect(registeredAttendee.registeredAt).toBeInstanceOf(Date)

    for (let attendeeIndex = 0; attendeeIndex < 3; attendeeIndex += 1) {
      const queuedUser = await createUserWithMembership()
      const queuedAvailability = await core.attendanceService.getRegistrationAvailability(
        dbClient,
        attendance.id,
        null,
        queuedUser.id,
        options
      )
      invariant(queuedAvailability.success)

      const queuedAttendee = await core.attendanceService.registerAttendee(dbClient, queuedAvailability)

      expect(queuedAttendee.registeredAt).toBeNull()
      queuedAttendees.push(queuedAttendee)
    }

    const [delayedAttendee, laterEligibleAttendee, earlierEligibleAttendee] = queuedAttendees
    const now = getCurrentUTC()

    // Eligibility order deliberately differs from request order, and one attendee is still serving a delay.
    for (const [attendee, createdAt, delayHours] of [
      [delayedAttendee, subHours(now, 3), 4],
      [laterEligibleAttendee, subHours(now, 3), 2],
      [earlierEligibleAttendee, subHours(now, 2), 0],
    ] as const) {
      await dbClient.attendee.update({
        where: {
          id: attendee.id,
        },
        data: {
          createdAt,
          registrationPoolDelayHours: delayHours,
        },
      })
    }

    await core.attendanceService.executeReserveAttendeeTask(dbClient, {
      attendanceId: attendance.id,
      attendeeId: earlierEligibleAttendee.id,
    })

    const attendeeWhilePoolIsFull = await core.attendanceService.getAttendeeById(dbClient, earlierEligibleAttendee.id)

    expect(attendeeWhilePoolIsFull.registeredAt).toBeNull()

    await core.attendanceService.deregisterAttendee(dbClient, registeredAttendee.id, {
      ignoreDeregistrationWindow: false,
    })

    const firstPromotedAttendee = await core.attendanceService.getAttendeeById(dbClient, earlierEligibleAttendee.id)
    const stillQueuedAttendee = await core.attendanceService.getAttendeeById(dbClient, laterEligibleAttendee.id)

    expect(firstPromotedAttendee.registeredAt).toBeInstanceOf(Date)
    expect(stillQueuedAttendee.registeredAt).toBeNull()
    await expect(core.attendanceService.getAttendeeById(dbClient, registeredAttendee.id)).rejects.toThrow(NotFoundError)

    await core.attendanceService.deregisterAttendee(dbClient, earlierEligibleAttendee.id, {
      ignoreDeregistrationWindow: false,
    })

    const secondPromotedAttendee = await core.attendanceService.getAttendeeById(dbClient, laterEligibleAttendee.id)

    expect(secondPromotedAttendee.registeredAt).toBeInstanceOf(Date)

    await core.attendanceService.deregisterAttendee(dbClient, laterEligibleAttendee.id, {
      ignoreDeregistrationWindow: false,
    })

    const remainingAttendee = await core.attendanceService.getAttendeeById(dbClient, delayedAttendee.id)

    expect(remainingAttendee.registeredAt).toBeNull()
  })

  it("should not promote the next user in line if the deregistered user is queued", async () => {
    const alphaSubject = randomUUID()
    const betaSubject = randomUUID()
    auth0Client.users.get.mockImplementation(async ({ id }) => getMockAuth0UserResponse(id))
    const alphaWOM = await core.userService.register(dbClient, alphaSubject)
    const betaWOM = await core.userService.register(dbClient, betaSubject)
    const alpha = await core.userService.createMembership(dbClient, alphaWOM.id, getMockMembership())
    const beta = await core.userService.createMembership(dbClient, betaWOM.id, getMockMembership())
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    // Neither user gets an immediate reservation, so both are queued and deregistration will not promote the next user
    const alphaAttendeeResult = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      alpha.id,
      {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }
    )
    invariant(alphaAttendeeResult.success)
    const alphaAttendee = await core.attendanceService.registerAttendee(dbClient, alphaAttendeeResult)
    const betaAttendeeResult = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      beta.id,
      {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }
    )
    invariant(betaAttendeeResult.success)
    const betaAttendee = await core.attendanceService.registerAttendee(dbClient, betaAttendeeResult)

    expect(alphaAttendee.registeredAt).not.toBeNull()
    expect(betaAttendee.registeredAt).not.toBeNull()

    // Manually move both attendees to the queue.
    await core.attendanceService.updateAttendeeById(dbClient, alphaAttendee.id, {
      registeredAt: null,
    })
    await core.attendanceService.updateAttendeeById(dbClient, betaAttendee.id, {
      registeredAt: null,
    })

    await expect(
      core.attendanceService.deregisterAttendee(dbClient, alphaAttendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).resolves.toBeUndefined()

    const updatedAttendance = await core.attendanceService.getAttendanceByAttendeeId(dbClient, betaAttendee.id)
    const betaAttendanceUpdated = updatedAttendance.attendees.find((attendee) => attendee.id === betaAttendee.id)
    expect(betaAttendanceUpdated).toBeDefined()
    expect(betaAttendanceUpdated?.registeredAt).toBeNull()
  })

  it("should registrer the physical attendance of a user for an event", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()
    // We immediately reserve the user so that they can be registered
    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)
    expect(attendee.registeredAt).not.toBeNull()

    const attendedAt = getCurrentUTC()
    await core.attendanceService.registerAttendance(dbClient, attendee.id, attendedAt)

    const checkedInAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

    expect(checkedInAttendee.attendedAt).toEqual(attendedAt)

    await core.attendanceService.registerAttendance(dbClient, attendee.id, addMinutes(attendedAt, 1))

    const unchangedAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

    expect(unchangedAttendee.attendedAt).toEqual(attendedAt)

    await core.attendanceService.registerAttendance(dbClient, attendee.id, null)

    const clearedAttendee = await core.attendanceService.getAttendeeById(dbClient, attendee.id)

    expect(clearedAttendee.attendedAt).toBeNull()
  })

  it("should fail if you attempt to registrer physical attendance for a non-registered user", async () => {
    await expect(core.attendanceService.registerAttendance(dbClient, randomUUID(), getCurrentUTC())).rejects.toThrow(
      NotFoundError
    )
  })

  it("should require a turnstile token unless explicitly overridden", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )

    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())

    const rejectedAvailability = await core.attendanceService.getRegistrationAvailability(
      dbClient,
      attendance.id,
      null,
      user.id,
      {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: false,
      }
    )

    expect(rejectedAvailability).toMatchObject({ success: false, userCause: "INVALID_TURNSTILE_TOKEN" })

    const [punishment, result] = await Promise.all([
      core.personalMarkService.findPunishmentByUserId(dbClient, user.id),
      core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }),
    ])

    invariant(result.success)

    const view = buildRegistrationAvailabilityView(user.id, result, punishment, attendance)

    expect(view.registration?.canRegister).toBe(true)
    expect(view.deregistration).toBeNull()
    expect(view.registration?.eventRejectionCause).toBeNull()
    expect(view.registration?.userRejectionCause).toBeNull()
  })

  it("should build deregistration availability view for registered attendee", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )

    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())

    const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendance.id, null, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      overriddenAttendancePoolId: null,
      ignoreRegisteredToParent: false,
      overrideTurnstileCheck: true,
    })
    invariant(result.success)
    const attendee = await core.attendanceService.registerAttendee(dbClient, result)
    const updatedAttendance = await core.attendanceService.getAttendanceById(dbClient, attendance.id)
    const registeredAttendee = updatedAttendance.attendees.find((entry) => entry.id === attendee.id)
    invariant(registeredAttendee !== undefined)

    const view = buildDeregistrationAvailabilityView(user.id, registeredAttendee, updatedAttendance, null)

    expect(view.registration).toBeNull()
    expect(view.deregistration).toEqual(
      expect.objectContaining({
        attendeeId: attendee.id,
        canDeregister: true,
        isWithinGracePeriod: true,
        requiresDeregisterReason: false,
      })
    )
  })

  it("should delete an empty attendance and unlink it from the event", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.eventService.updateEventAttendance(dbClient, event.id, attendance.id)

    await core.attendanceService.deleteAttendance(dbClient, attendance.id)

    const updatedEvent = await core.eventService.getEventById(dbClient, event.id)
    expect(updatedEvent.attendanceId).toBeNull()
    await expect(core.attendanceService.getAttendanceById(dbClient, attendance.id)).rejects.toThrow(NotFoundError)
  })

  it("should not delete an attendance that has pools", async () => {
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(dbClient, attendance.id, getMockAttendancePool())

    await expect(core.attendanceService.deleteAttendance(dbClient, attendance.id)).rejects.toThrow(
      FailedPreconditionError
    )

    const remainingAttendance = await core.attendanceService.getAttendanceById(dbClient, attendance.id)
    expect(remainingAttendance.id).toBe(attendance.id)
    expect(remainingAttendance.pools).toHaveLength(1)
  })
})
