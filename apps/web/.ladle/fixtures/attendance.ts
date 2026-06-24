import type { AttendanceRouter } from "@dotkomonline/rpc"
import type { Attendance, AttendanceSummary, Attendee } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { Punishment } from "@dotkomonline/rpc/mark"
import type { User } from "@dotkomonline/rpc/user"
import { getCurrentSemesterStart, getCurrentUTC, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"
import { addDays, addHours, addMinutes, subHours, subMinutes } from "date-fns"

export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001"
export const MOCK_ATTENDANCE_ID = "00000000-0000-4000-8000-000000000010"
export const MOCK_POOL_ID = "00000000-0000-4000-8000-000000000020"
export const MOCK_ATTENDEE_ID = "00000000-0000-4000-8000-000000000030"
export const MOCK_EVENT_ID = "00000000-0000-4000-8000-000000000040"

const now = getCurrentUTC()

export type MockAttendanceStatus = "NOT_OPENED" | "OPEN" | "CLOSED"

export type CreateMockAttendanceOptions = {
  status?: MockAttendanceStatus
  attendancePrice?: number | null
  capacity?: number
  reservedAttendeeCount?: number
  yearCriteria?: number[]
  attendees?: Attendee[]
  registerStartOffsetMinutes?: number
}

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: MOCK_USER_ID,
  name: "Jan Teigen",
  email: "jan.teigen@teigen.no",
  username: "janteigen",
  imageUrl: null,
  createdAt: now,
  updatedAt: now,
  biography: null,
  phone: null,
  gender: "UNKNOWN",
  dietaryRestrictions: null,
  ntnuUsername: null,
  flags: [],
  workspaceUserId: null,
  privacyPermissionsId: null,
  notificationPermissionsId: null,
  memberships: [
    {
      id: "00000000-0000-4000-8000-000000000050",
      type: "BACHELOR_STUDENT",
      specialization: null,
      start: getCurrentSemesterStart(),
      end: getNextSemesterStart(),
      semester: isSpringSemester() ? 1 : 0,
      userId: MOCK_USER_ID,
    },
  ],
  ...overrides,
})

export const createMockAttendee = (overrides: Partial<Attendee> = {}): Attendee => {
  const user = createMockUser()

  return {
    id: MOCK_ATTENDEE_ID,
    userId: MOCK_USER_ID,
    attendanceId: MOCK_ATTENDANCE_ID,
    attendancePoolId: MOCK_POOL_ID,
    createdAt: now,
    updatedAt: now,
    reserved: true,
    attendedAt: null,
    earliestReservationAt: now,
    paymentChargedAt: null,
    paymentRefundedAt: null,
    paymentDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentChargeDeadline: null,
    paymentReservedAt: null,
    paymentRefundedById: null,
    paymentCheckoutUrl: null,
    userGrade: 1,
    selections: [],
    user,
    ...overrides,
  }
}

const getRegistrationWindow = (status: MockAttendanceStatus) => {
  if (status === "NOT_OPENED") {
    return {
      registerStart: addHours(now, 2),
      registerEnd: addDays(now, 2),
      deregisterDeadline: addDays(now, 3),
    }
  }

  if (status === "CLOSED") {
    return {
      registerStart: subHours(now, 48),
      registerEnd: subHours(now, 1),
      deregisterDeadline: subHours(now, 2),
    }
  }

  return {
    registerStart: subHours(now, 1),
    registerEnd: addHours(now, 12),
    deregisterDeadline: addDays(now, 2),
  }
}

export const createMockAttendance = (options: CreateMockAttendanceOptions = {}): Attendance => {
  const {
    status = "OPEN",
    attendancePrice = null,
    capacity = 50,
    yearCriteria = [1],
    attendees = [],
    registerStartOffsetMinutes,
  } = options

  const registrationWindow = getRegistrationWindow(status)
  const registerStart =
    registerStartOffsetMinutes !== undefined
      ? addMinutes(now, registerStartOffsetMinutes)
      : registrationWindow.registerStart

  return {
    id: MOCK_ATTENDANCE_ID,
    registerStart,
    registerEnd: registrationWindow.registerEnd,
    deregisterDeadline: registrationWindow.deregisterDeadline,
    attendancePrice,
    pools: [
      {
        id: MOCK_POOL_ID,
        title: "1. klasse",
        capacity,
        mergeDelayHours: null,
        yearCriteria,
        attendanceId: MOCK_ATTENDANCE_ID,
        taskId: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    attendees,
    selections: [],
    createdAt: now,
    updatedAt: now,
  }
}

export const createMockAttendanceSummary = (
  options: CreateMockAttendanceOptions & { currentUserAttendee?: Attendee | null } = {}
): AttendanceSummary => {
  const { currentUserAttendee = null, ...attendanceOptions } = options
  const attendance = createMockAttendance(attendanceOptions)
  const reservedAttendeeCount = attendance.attendees.filter((attendee) => attendee.reserved).length

  return {
    ...attendance,
    currentUserAttendee,
    reservedAttendeeCount,
  }
}

export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: MOCK_EVENT_ID,
  title: "Testarrangement",
  description: "Jan Teigen på kontoret",
  start: addDays(now, 7),
  end: addDays(now, 7),
  type: "SOCIAL",
  status: "PUBLIC",
  imageUrl: null,
  locationTitle: "Kontoret",
  locationAddress: "A4-137, Realfagbygget",
  locationLink: null,
  companies: [],
  hostingGroups: [],
  createdAt: now,
  updatedAt: now,
  attendanceId: MOCK_ATTENDANCE_ID,
  parentId: null,
  contestId: null,
  metadataImportId: null,
  shortDescription: null,
  markForMissedAttendance: true,
  ...overrides,
})

export type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

export const createMockRegistrationAvailability = (
  overrides: Partial<RegistrationAvailability> = {}
): RegistrationAvailability => ({
  userId: MOCK_USER_ID,
  punishment: null,
  pool: {
    id: MOCK_POOL_ID,
    mergeDelayHours: null,
    isPoolFull: false,
  },
  registration: {
    canRegister: true,
    rejectionCause: null,
    reservationActiveAt: null,
    willBeUnreserved: false,
    hasMergeDelay: false,
  },
  deregistration: null,
  ...overrides,
})

export const createMockPunishment = (overrides: Partial<Punishment> = {}): Punishment => ({
  suspended: false,
  delay: 4,
  ...overrides,
})

export const createAttendanceWithReservedUser = (): Attendance => {
  const user = createMockUser()
  const attendee = createMockAttendee({ user, reserved: true })

  return createMockAttendance({
    attendees: [attendee],
  })
}

export const createAttendanceWithWaitlistedUser = (queueSize = 2): Attendance => {
  const user = createMockUser()
  const currentAttendee = createMockAttendee({
    user,
    reserved: false,
    earliestReservationAt: addMinutes(now, 5),
  })

  const otherAttendees = Array.from({ length: queueSize - 1 }, (_, index) =>
    createMockAttendee({
      id: `00000000-0000-4000-8000-00000000003${index + 1}`,
      userId: `00000000-0000-4000-8000-00000000000${index + 2}`,
      user: createMockUser({
        id: `00000000-0000-4000-8000-00000000000${index + 2}`,
        username: `bruker${index + 2}`,
      }),
      reserved: false,
      earliestReservationAt: subMinutes(now, index + 1),
    })
  )

  return createMockAttendance({
    attendees: [currentAttendee, ...otherAttendees],
  })
}

export const createAttendanceWithPaymentCountdown = (): Attendance => {
  const user = createMockUser()
  const attendee = createMockAttendee({
    user,
    reserved: true,
    paymentDeadline: addMinutes(now, 45),
    paymentLink: "https://example.com/betaling",
    createdAt: subMinutes(now, 15),
  })

  return createMockAttendance({
    attendancePrice: 100,
    attendees: [attendee],
  })
}

export const createAttendanceWithServingPunishment = (): Attendance => {
  const user = createMockUser()
  const attendee = createMockAttendee({
    user,
    reserved: false,
    createdAt: now,
    earliestReservationAt: addHours(now, 4),
  })

  return createMockAttendance({
    attendees: [attendee],
  })
}

export const createAttendanceOpeningSoon = (): Attendance =>
  createMockAttendance({
    registerStartOffsetMinutes: 10,
  })

export const createAttendanceWithFullPool = (): Attendance => {
  const attendees = [
    createMockAttendee({
      id: "00000000-0000-4000-8000-000000000031",
      userId: "00000000-0000-4000-8000-000000000011",
      user: createMockUser({ id: "00000000-0000-4000-8000-000000000011", username: "bruker1" }),
      reserved: true,
    }),
    createMockAttendee({
      id: "00000000-0000-4000-8000-000000000032",
      userId: "00000000-0000-4000-8000-000000000012",
      user: createMockUser({ id: "00000000-0000-4000-8000-000000000012", username: "bruker2" }),
      reserved: true,
    }),
  ]

  return createMockAttendance({
    capacity: 2,
    attendees,
  })
}

export const createIneligiblePoolAttendance = (): Attendance =>
  createMockAttendance({
    yearCriteria: [5],
  })

export const createLockedDeregisterAttendance = (): { attendance: Attendance; attendee: Attendee } => {
  const user = createMockUser()
  const attendee = createMockAttendee({ user, reserved: true })

  return {
    attendance: {
      ...createMockAttendance({ status: "OPEN", attendees: [attendee] }),
      deregisterDeadline: subHours(now, 1),
    } as Attendance,
    attendee,
  }
}

export const createMockDeregistrationAvailability = (
  overrides: Partial<NonNullable<RegistrationAvailability["deregistration"]>> = {}
): RegistrationAvailability =>
  createMockRegistrationAvailability({
    registration: null,
    deregistration: {
      attendeeId: MOCK_ATTENDEE_ID,
      canDeregister: true,
      rejectionCause: null,
      isWithinGracePeriod: true,
      requiresDeregisterReason: false,
      actualDeregisterDeadline: addDays(now, 2),
      isPastDeregisterDeadline: false,
      hasBeenCharged: false,
      chargeScheduleDate: null,
      ...overrides,
    },
  })
