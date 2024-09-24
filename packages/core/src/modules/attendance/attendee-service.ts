import type {
  AttendanceId,
  AttendancePoolId,
  Attendee,
  AttendeeId,
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
import { AttendanceNotFound } from "./attendance-error"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError, AttendeeRegistrationError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"
import type { WaitlistAttendeService } from "./waitlist-attendee-service"

export interface AttendeeService {
  updateExtraChoices(id: AttendeeId, choices: ExtrasChoices): Promise<Attendee>
  registerForEvent(userId: string, attendanceId: string, time: Date): Promise<Attendee | WaitlistAttendee>
  deregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  adminDeregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<Attendee>
  handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId): Promise<QrCodeRegistrationAttendee>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeServiceImpl implements AttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository,
    private readonly attendanceRespository: AttendanceRepository,
    private readonly userService: UserService,
    private readonly waitlistAttendeeService: WaitlistAttendeService
  ) {}

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

  async registerForEvent(userId: UserId, attendancePoolId: AttendanceId, registrationTime: Date) {
    const user = await this.userService.getById(userId)
    const attendancePool = await this.attendancePoolRepository.get(attendancePoolId)
    if (attendancePool === null) {
      throw new AttendancePoolNotFoundError(attendancePoolId)
    }

    if (user === null) {
      throw new UserNotFoundError(userId)
    }

    const attendanceId = attendancePool.attendanceId

    // is user already registered?
    const userAlreadyRegistered = await this.attendeeRepository.getByUserId(userId, attendanceId)
    if (userAlreadyRegistered !== null) {
      throw new AttendeeRegistrationError("User is already registered")
    }

    const studyStartYear = user.metadata?.study_start_year ?? null
    if (studyStartYear === null) {
      throw new AttendeeRegistrationError("User has no study start year")
    }

    const beforeSummer = new Date().getMonth() < 7
    let classYear = new Date().getFullYear() - studyStartYear
    if (beforeSummer) {
      classYear -= 1
    }

    // Does user match criteria for the pool?
    if (attendancePool.yearCriteria.includes(classYear) === false) {
      throw new AttendeeRegistrationError(
        `Pool criteria: ${attendancePool.yearCriteria.join(", ")}, user study year: ${classYear}`
      )
    }

    // is attendance open?
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

    // is the pool full?
    const numAttendees = await this.attendancePoolRepository.getNumAttendees(attendancePool.id)

    if (numAttendees === attendancePool.capacity) {
      // create waitlist attendee
      const ins = await this.waitlistAttendeeService.create({
        attendanceId,
        userId,
        isPunished: false,
        registeredAt: new Date(),
        studyYear: classYear,
        name: user.metadata ? `${user.firstName} ${user.lastName}` : "",
      })
      return ins
    }

    if (numAttendees > attendancePool.capacity) {
      throw new IllegalStateError("Pool has more attendees than the capacity")
    }

    const attendee = await this.attendeeRepository.create({
      attendancePoolId: attendancePool.id,
      userId,
      attended: false,
      extrasChoices: [],
      attendanceId,
      registeredAt: registrationTime,
    })

    return attendee
  }

  async deregisterForEvent(id: AttendeeId, now: Date) {
    const attendance = await this.attendanceRespository.getByAttendeeId(id)

    if (attendance === null) {
      throw new AttendanceNotFound(id)
    }

    if (attendance.deregisterDeadline < now) {
      throw new AttendeeDeregistrationError("The deregister deadline has passed")
    }

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
    return this.attendeeRepository.getByAttendanceId(id)
  }

  async getByAttendancePoolId(id: AttendancePoolId) {
    return await this.attendeeRepository.getByAttendancePoolId(id)
  }
}
