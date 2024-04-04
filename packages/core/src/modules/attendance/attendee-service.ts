import {
  type AttendanceId,
  AttendancePoolId,
  type Attendee,
  type AttendeeId,
  type AttendeeUser,
  type AttendeeWrite,
  type UserId,
  WaitlistAttendee,
} from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import { type UserService } from "../user/user-service"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError, AttendeeRegistrationError, UpdateAttendeeError } from "./attendee-error"
import { AttendeeRepository } from "./attendee-repository"
import { WaitlistAttendeService } from "./waitlist-attendee-service"

export interface AttendeeService {
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<Attendee>
  registerForEvent(userId: string, attendanceId: string, time: Date): Promise<Attendee | WaitlistAttendee>
  deregisterForEvent(id: AttendeeId, time: Date): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<AttendeeUser[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<AttendeeUser[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<Attendee>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeServiceImpl implements AttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository,
    private readonly attendanceRespository: AttendanceRepository,
    private readonly userService: UserService,
    private readonly waitlistAttendeeService: WaitlistAttendeService
  ) {
    this.attendeeRepository = attendeeRepository
    this.userService = userService
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
      throw new UpdateAttendeeError(id)
    }

    return attendee
  }

  async updateExtraChoices(id: AttendanceId, questionId: string, choiceId: string) {
    const attendee = await this.attendeeRepository.updateExtraChoices(id, questionId, choiceId)

    if (attendee === null) {
      throw new UpdateAttendeeError(id)
    }

    return attendee
  }

  async registerForEvent(userId: UserId, attendanceId: AttendanceId, registrationTime: Date) {
    const user = await this.userService.getUserById(userId)

    if (user === undefined) {
      throw new AttendeeRegistrationError("User not found")
    }

    // is user already registered?
    const userAlreadyRegistered = await this.attendeeRepository.getByUserId(userId, attendanceId)
    if (userAlreadyRegistered !== null) {
      throw new AttendeeRegistrationError("User is already registered")
    }

    // is attendance open?
    const attendance = await this.attendanceRespository.getById(attendanceId)
    if (attendance === null) {
      throw new AttendeeRegistrationError("Attendance not found")
    }

    if (registrationTime < attendance.registerStart) {
      throw new AttendeeRegistrationError("Attendance has not started yet")
    }

    if (registrationTime > attendance.registerEnd) {
      throw new AttendeeRegistrationError("Attendance has ended")
    }

    // does the user have a pool to register to?
    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)
    const poolWithMatchingCriteria = pools
      .filter((pool) => pool.active)
      .find((pool) => {
        const year = user.studyYear
        return pool.yearCriteria.includes(year)
      })

    if (poolWithMatchingCriteria === undefined) {
      throw new AttendeeRegistrationError("User does not match any pool")
    }

    // is the pool full?
    const numAttendees = await this.attendancePoolRepository.getNumAttendees(poolWithMatchingCriteria.id)

    if (numAttendees === poolWithMatchingCriteria.capacity) {
      // create waitlist attendee
      const ins = await this.waitlistAttendeeService.create({
        attendanceId,
        userId,
        isPunished: false,
        registeredAt: new Date(),
        studyYear: user.studyYear,
        name: user.name,
      })
      return ins
    }

    if (numAttendees > poolWithMatchingCriteria.capacity) {
      throw new IllegalStateError("Pool has more attendees than the capacity")
    }

    const attendee = await this.attendeeRepository.create({
      attendancePoolId: poolWithMatchingCriteria.id,
      userId,
      attended: false,
      extrasChoices: null,
      attendanceId,
      registeredAt: registrationTime,
    })

    return attendee
  }

  async deregisterForEvent(id: AttendeeId, now: Date) {
    const attendance = await this.attendanceRespository.getByAttendeeId(id)

    if (attendance === null) {
      throw new AttendeeDeregistrationError("Attendance not found")
    }

    if (attendance.deregisterDeadline < now) {
      throw new AttendeeDeregistrationError("The deregister deadline has passed")
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
