import { randomUUID } from "node:crypto"
import {
  type AttendancePoolWrite,
  type AttendanceWrite,
  type MembershipWrite,
  findActiveMembership,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { faker } from "@faker-js/faker"
import type { ApiResponse, GetUsers200ResponseOneOfInner } from "auth0"
import { addDays, addHours, addMinutes, isFuture, subHours } from "date-fns"
import { describe, expect, it } from "vitest"
import { auth0Client, core, dbClient } from "../../../vitest-integration.setup"
import { AttendanceNotFound, AttendanceValidationError } from "./attendance-error"
import { getMockGroup } from "./event.e2e-spec"

function getMockAttendance(input: Partial<AttendanceWrite> = {}): AttendanceWrite {
  return {
    registerStart: getCurrentUTC(),
    registerEnd: addHours(getCurrentUTC(), 12),
    deregisterDeadline: addDays(getCurrentUTC(), 2),
    selections: [],
    ...input,
  }
}

function getMockAttendancePool(input: Partial<AttendancePoolWrite> = {}): AttendancePoolWrite {
  return {
    title: faker.lorem.sentence(),
    mergeDelayHours: null,
    capacity: 10,
    yearCriteria: [1, 2, 3, 4, 5],
    ...input,
  }
}

function getMockMembership(input: Partial<MembershipWrite> = {}): MembershipWrite {
  return {
    type: "BACHELOR_STUDENT",
    start: addDays(getCurrentUTC(), -100),
    end: addDays(getCurrentUTC(), 100),
    specialization: null,
    ...input,
  }
}

function getMockAuth0UserResponse(subject: string): ApiResponse<GetUsers200ResponseOneOfInner> {
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
    ).rejects.toThrowError(AttendanceValidationError)
    await expect(() =>
      core.attendanceService.createAttendance(dbClient, {
        registerStart: getCurrentUTC(),
        // This is less than one hour
        registerEnd: addMinutes(getCurrentUTC(), 10),
        deregisterDeadline: addHours(getCurrentUTC(), 2),
        selections: [],
      })
    ).rejects.toThrowError(AttendanceValidationError)
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
    ).rejects.toThrow(AttendanceValidationError)
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
    ).rejects.toThrow(AttendanceValidationError)
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

  it("should fail to register if there is no applicable pool for a user", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()
    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)
  })

  it("should throw an error if the user has no active membership", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    const user = await core.userService.register(dbClient, subject)
    expect(findActiveMembership(user)).toBeNull()
    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)
  })

  it("should throw an error if the user is suspended", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const group = await core.groupService.create(dbClient, getMockGroup({ abbreviation: "Bedkom" }))
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    // Create a user and suspend them by giving them more than 6 marks.
    const user = await core.userService.register(dbClient, subject)
    const mark = await core.markService.createMark(dbClient, {
      type: "MANUAL",
      title: "Du har fått suspensjon",
      details: null,
      duration: 14,
      weight: 999,
      groupSlug: group.slug,
    })
    await core.personalMarkService.addToUser(dbClient, user.id, mark.id, user.id)
    const punishment = await core.personalMarkService.findPunishmentByUserId(dbClient, user.id)
    expect(punishment).toEqual(expect.objectContaining({ suspended: true }))

    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)
  })

  it("should not allow registration outside of the registration window", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(
      dbClient,
      getMockAttendance({
        registerStart: addDays(getCurrentUTC(), 1), // Registration starts tomorrow
        registerEnd: addDays(getCurrentUTC(), 2), // Registration ends in two days
      })
    )
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

    // Attempt to register before the registration window opens
    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)

    // But bypassing the registration window, it should succeed
    const registration = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: true,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(registration.userId).toEqual(user.id)
  })

  it("should not allow registering twice for the same attendance", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
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
    await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })

    // Attempt to register the same user again for the same attendance
    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: true,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)
  })

  it("should add a reservation time if the user has a punishment", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
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
    const mark = await core.markService.createMark(dbClient, {
      type: "MANUAL",
      title: "Du har fått en reservasjonstid",
      details: null,
      duration: 14,
      weight: 1,
      groupSlug: group.slug,
    })
    await core.personalMarkService.addToUser(dbClient, user.id, mark.id, user.id)
    const punishment = await core.personalMarkService.findPunishmentByUserId(dbClient, user.id)
    expect(punishment).toEqual(expect.objectContaining({ delay: 1, suspended: false }))

    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(attendee.userId).toEqual(user.id)
    expect(attendee.earliestReservationAt).toSatisfy(isFuture)
    expect(attendee.reserved).toBe(false)
  })

  it("should add a reservation time if the pool is a merge pool with delay", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    // The membership for the test user is registered to be a first year student
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        mergeDelayHours: 24,
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(attendee.userId).toEqual(user.id)
    expect(attendee.earliestReservationAt).toSatisfy(isFuture)
    expect(attendee.reserved).toBe(false)
  })

  it("should immediately reserve spots if immediateReservation=true", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
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

    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(attendee.reserved).toBe(true)
  })

  it("should not deregister an attendee past the deadline", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })

    await core.attendanceService.updateAttendanceById(dbClient, attendance.id, {
      deregisterDeadline: subHours(getCurrentUTC(), 1), // Set the deadline to one hour ago
    })
    await expect(
      core.attendanceService.deregisterAttendee(dbClient, attendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).rejects.toThrow(AttendanceValidationError)
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

    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    // We create an attendance pool that the user cannot attend, because they are not a 5th year student
    const pool = await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        mergeDelayHours: 24,
        yearCriteria: [5],
      })
    )
    const userWithoutMembership = await core.userService.register(dbClient, subject)
    const user = await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
    expect(findActiveMembership(user)).not.toBeNull()

    // If the user themselves attempt to register, it should fail because there is no applicable pool
    await expect(
      core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
        immediateReservation: false,
        immediatePayment: false,
        ignoreRegistrationWindow: false,
        forceAttendancePoolId: null,
        ignoreRegisteredToParent: false,
      })
    ).rejects.toThrow(AttendanceValidationError)

    // But if an admin registers the user with an forceAttendancePoolId, it should succeed
    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: pool.id, // Force the user into the pool
      ignoreRegisteredToParent: false,
    })

    expect(attendee.userId).toEqual(user.id)
    expect(attendee.earliestReservationAt).toSatisfy(isFuture)
    expect(attendee.reserved).toBe(true)
  })

  it("should try to attend the next user in line after deregistering", async () => {
    const alphaSubject = randomUUID()
    const betaSubject = randomUUID()
    auth0Client.users.get.mockImplementation(async ({ id }) => getMockAuth0UserResponse(id))
    const alphaWOM = await core.userService.register(dbClient, alphaSubject)
    const betaWOM = await core.userService.register(dbClient, betaSubject)
    const alpha = await core.userService.createMembership(dbClient, alphaWOM.id, getMockMembership())
    const beta = await core.userService.createMembership(dbClient, betaWOM.id, getMockMembership())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )

    // Alpha gets immediate reservation, so that beta can be next in line
    const alphaAttendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, alpha.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    const betaAttendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, beta.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })

    expect(alphaAttendee.reserved).toBe(true)
    expect(betaAttendee.reserved).toBe(true)

    // Manually kick beta attendee out of the pool, so that they are unreserved.
    await core.attendanceService.updateAttendeeById(dbClient, betaAttendee.id, {
      reserved: false,
    })

    await expect(
      core.attendanceService.deregisterAttendee(dbClient, alphaAttendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).resolves.toBeUndefined()

    const updatedAttendance = await core.attendanceService.getAttendanceByAttendeeId(dbClient, betaAttendee.id)
    const betaAttendanceUpdated = updatedAttendance.attendees.find((attendee) => attendee.id === betaAttendee.id)
    expect(betaAttendanceUpdated).toBeDefined()
    expect(betaAttendanceUpdated?.reserved).toBe(true)
  })

  it("should not try attending the next user in line if the deregistered user is not reserved", async () => {
    const alphaSubject = randomUUID()
    const betaSubject = randomUUID()
    auth0Client.users.get.mockImplementation(async ({ id }) => getMockAuth0UserResponse(id))
    const alphaWOM = await core.userService.register(dbClient, alphaSubject)
    const betaWOM = await core.userService.register(dbClient, betaSubject)
    const alpha = await core.userService.createMembership(dbClient, alphaWOM.id, getMockMembership())
    const beta = await core.userService.createMembership(dbClient, betaWOM.id, getMockMembership())
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
    await core.attendanceService.createAttendancePool(
      dbClient,
      attendance.id,
      getMockAttendancePool({
        yearCriteria: [1],
      })
    )
    // Neither users get immediate reservation, so they are not reserved, and the bump will not reserve the next user
    const alphaAttendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, alpha.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    const betaAttendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, beta.id, {
      immediateReservation: false,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(alphaAttendee.reserved).toBe(true)
    expect(betaAttendee.reserved).toBe(true)

    // Manually kick both of them to the waitlist to simulate that they are not reserved.
    await core.attendanceService.updateAttendeeById(dbClient, alphaAttendee.id, {
      reserved: false,
    })
    await core.attendanceService.updateAttendeeById(dbClient, betaAttendee.id, {
      reserved: false,
    })

    await expect(
      core.attendanceService.deregisterAttendee(dbClient, alphaAttendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).resolves.toBeUndefined()

    const updatedAttendance = await core.attendanceService.getAttendanceByAttendeeId(dbClient, betaAttendee.id)
    const betaAttendanceUpdated = updatedAttendance.attendees.find((attendee) => attendee.id === betaAttendee.id)
    expect(betaAttendanceUpdated).toBeDefined()
    expect(betaAttendanceUpdated?.reserved).toBe(false)
  })

  it("should register the physical attendance of a user for an event", async () => {
    const subject = randomUUID()
    auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
    const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
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
    const attendee = await core.attendanceService.registerAttendee(dbClient, attendance.id, user.id, {
      immediateReservation: true,
      immediatePayment: false,
      ignoreRegistrationWindow: false,
      forceAttendancePoolId: null,
      ignoreRegisteredToParent: false,
    })
    expect(attendee.reserved).toBe(true)

    await expect(
      core.attendanceService.registerAttendance(dbClient, attendee.id, getCurrentUTC())
    ).resolves.toBeUndefined()
  })

  it("should fail if you attempt to register physical attendance for a non-registered user", async () => {
    await expect(core.attendanceService.registerAttendance(dbClient, randomUUID(), getCurrentUTC())).rejects.toThrow(
      AttendanceNotFound
    )
  })
})
