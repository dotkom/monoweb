import type {
  AttendanceId,
  AttendancePool,
  AttendancePoolId,
  Attendee,
  AttendeeId,
  AttendeeUser,
  AttendeeWrite,
  ExtrasChoices,
  QrCodeRegistrationAttendee,
  UserId,
  WaitlistAttendee,
} from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import { AttendeeNotFoundError } from "../event/attendee-error"
import { UserNotFoundError } from "../user/user-error"
import type { UserService } from "../user/user-service"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError, AttendeeRegistrationError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"
import type { WaitlistAttendeService } from "./waitlist-attendee-service"

export interface AttendeeService {
  getAttendableAttendancePool(userId: UserId, attendanceId: AttendanceId): Promise<AttendancePool | null>
  canRegisterForEvent(userId: UserId, attendancePoolId: AttendanceId, registrationTime: Date): Promise<void>
  canDeregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  updateExtraChoices(id: AttendeeId, choices: ExtrasChoices): Promise<Attendee>
  registerForEvent(userId: string, attendanceId: string, time: Date): Promise<Attendee | WaitlistAttendee>
  deregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  adminDeregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<AttendeeUser[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<AttendeeUser[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<Attendee>
  handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId): Promise<QrCodeRegistrationAttendee>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
  getByAuth0UserId(auth0UserId: string, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeServiceImpl implements AttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository,
    private readonly attendanceRespository: AttendanceRepository,
    private readonly userService: UserService,
    private readonly waitlistAttendeeService: WaitlistAttendeService
  ) {}

  async getByAuth0UserId(auth0UserId: string, attendanceId: AttendanceId) {
    const user = await this.userService.getByAuth0Id(auth0UserId)
    if (user === null) {
      return null
    }
    const attendee = await this.attendeeRepository.getByUserId(user.id, attendanceId)
    return attendee
  }

  async create(obj: AttendeeWrite) {
    return this.attendeeRepository.create(obj)
  }

  async delete(id: AttendeeId) {
    await this.attendeeRepository.delete(id)
  }

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)
    return attendee
  }

  async updateAttended(attended: boolean, id: AttendeeId) {
    const attendee = await this.attendeeRepository.update({ attended }, id)

    if (attendee === null) {
      throw new AttendeeNotFoundError(id)
    }

    return attendee
  }

  async handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId) {
    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)
    const user = await this.userService.getById(userId)
    if (attendee === null) {
      throw new AttendeeNotFoundError("")
    }
    if (user === null) {
      throw new UserNotFoundError(userId)
    }
    if (attendee.attended === true) {
      return { attendee, user, alreadyAttended: true }
    }
    await this.attendeeRepository.update({ attended: true }, attendee.id)

    return { attendee, user, alreadyAttended: false }
  }

  async updateExtraChoices(id: AttendanceId, choices: ExtrasChoices) {
    const attendee = await this.attendeeRepository.updateExtraChoices(id, choices)

    if (attendee === null) {
      throw new AttendeeNotFoundError(id)
    }

    return attendee
  }

  /**
   * Registers a user for an event
   *
   * @throws {AttendancePoolNotFoundError} If the attendance pool does not exist
   * @throws {UserNotFoundError} If the user does not exist
   * @throws {AttendeeRegistrationError} If the user is already registered, does not meet the year criteria, or the attendance has not started or has ended
   * @throws {IllegalStateError} If the pool has more attendees than the capacity
   */
  async registerForEvent(userId: UserId, attendancePoolId: AttendanceId, registrationTime: Date) {
    // This will throw an error if the user can't register
    this.canRegisterForEvent(userId, attendancePoolId, registrationTime)

    const user = await this.userService.getById(userId)
    const attendancePool = await this.attendancePoolRepository.get(attendancePoolId)

    if (attendancePool === null) {
      throw new AttendancePoolNotFoundError(attendancePoolId)
    }

    if (user === null) {
      throw new UserNotFoundError(userId)
    }

    const attendee = await this.attendeeRepository.create({
      attendancePoolId,
      userId,
      attended: false,
      extrasChoices: [],
      attendanceId: attendancePool.attendanceId,
      registeredAt: registrationTime,
    })

    const numAttendees = await this.attendancePoolRepository.getNumAttendees(attendancePool.id)

    if (numAttendees === attendancePool.capacity) {
      // Create waitlist attendee
      return await this.waitlistAttendeeService.create({
        attendanceId: attendancePool.attendanceId,
        userId,
        isPunished: false,
        registeredAt: new Date(),
        studyYear: user.studyYear,
        name: user.name,
      })
    }

    return attendee
  }

  /**
   * Checks if a user can register for an event
   *
   * @throws {AttendancePoolNotFoundError} If the attendance pool does not exist
   * @throws {UserNotFoundError} If the user does not exist
   * @throws {AttendeeRegistrationError} If the user is already registered, does not meet the year criteria, or the attendance has not started or has ended
   * @throws {IllegalStateError} If the pool has more attendees than the capacity
   */
  async canRegisterForEvent(userId: UserId, attendancePoolId: AttendancePoolId, registrationTime: Date) {
    const user = await this.userService.getById(userId)
    const attendancePool = await this.attendancePoolRepository.get(attendancePoolId)

    if (attendancePool === null) {
      throw new AttendancePoolNotFoundError(attendancePoolId)
    }

    if (user === null) {
      throw new UserNotFoundError(userId)
    }

    const attendanceId = attendancePool.attendanceId

    const userAlreadyRegistered = await this.attendeeRepository
      .getByUserId(userId, attendanceId)
      .then((attendee) => attendee !== null)

    if (userAlreadyRegistered) {
      throw new AttendeeRegistrationError("User already registered")
    }

    const userHasAttendancePool = attendancePool.yearCriteria.includes(user.studyYear)
    if (!userHasAttendancePool) {
      throw new AttendeeRegistrationError(
        `Pool criteria: ${attendancePool.yearCriteria.join(", ")}, user study year: ${user.studyYear}`
      )
    }

    const attendance = await this.attendanceRespository.getById(attendanceId)

    if (attendance === null) {
      throw new AttendancePoolNotFoundError(attendanceId)
    }

    if (registrationTime < attendance.registerStart) {
      throw new AttendeeRegistrationError("Attendance has not started yet")
    }

    if (registrationTime > attendance.registerEnd) {
      throw new AttendeeRegistrationError("Attendance has ended")
    }

    // Check if the pool is full
    const numAttendees = await this.attendancePoolRepository.getNumAttendees(attendancePool.id)

    if (numAttendees > attendancePool.capacity) {
      throw new IllegalStateError("Pool has more attendees than the capacity")
    }
  }

  /**
   * Checks if a user can deregister for an event
   *
   * @throws {AttendeeNotFoundError} If the attendee does not exist
   * @throws {AttendeeDeregistrationError} If the deregister deadline has passed
   */
  async canDeregisterForEvent(id: AttendeeId, time: Date) {
    const attendance = await this.attendanceRespository.getByAttendeeId(id)

    if (attendance === null) {
      throw new AttendeeNotFoundError(id)
    }

    if (time > attendance.deregisterDeadline) {
      throw new AttendeeDeregistrationError("The deregister deadline has passed")
    }
  }

  async getAttendableAttendancePool(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.userService.getById(userId)

    if (user === null) {
      throw new UserNotFoundError(userId)
    }

    const attendancePools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)

    return attendancePools.find((pool) => pool.yearCriteria.includes(user.studyYear)) ?? null
  }

  /**
   * Deregisters a user from an event
   *
   * @throws {AttendeeNotFoundError} If the attendee does not exist
   * @throws {AttendeeDeregistrationError} If the attendance has already started
   */
  async deregisterForEvent(id: AttendeeId, now: Date) {
    this.canDeregisterForEvent(id, now)

    await this.attendeeRepository.delete(id)
  }

  async adminDeregisterForEvent(id: AttendeeId, now: Date) {
    const attendance = await this.attendanceRespository.getByAttendeeId(id)

    if (attendance === null) {
      throw new AttendeeDeregistrationError("Attendance not found")
    }

    await this.attendeeRepository.delete(id)
  }

  async getByAttendanceId(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)
    return attendees
  }

  async getByAttendancePoolId(id: AttendancePoolId) {
    const attendees = await this.attendeeRepository.getByAttendancePoolId(id)
    return attendees
  }
}
