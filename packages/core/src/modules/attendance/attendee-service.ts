import {
  type AttendanceId,
  type Attendee,
  type AttendeeId,
  type AttendeeUser,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import { type UserService } from "../user/user-service"
import { AttendeeRepository } from "./attendee-repository"
import { AttendancePoolRepository } from "./attendance-pool-repository"

export interface AttendeeService {
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<Attendee>
  registerForEvent(userId: string, poolId: string): Promise<Attendee>
  deregisterForEvent(id: AttendeeId): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<AttendeeUser[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<AttendeeUser>
}

export class AttendeeServiceImpl implements AttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository,
    private readonly userService: UserService
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

  async updateAttended(attended: boolean, id: AttendeeId) {
    const attendee = await this.attendeeRepository.update({ attended }, id)
    const user = await this.userService.getUserById(attendee.userId)

    if (user === undefined) {
      throw new Error("User not found")
    }

    return {
      ...attendee,
      user,
    }
  }

  async updateExtraChoices(id: AttendanceId, questionId: string, choiceId: string) {
    const attendee = await this.attendeeRepository.updateExtraChoices(id, questionId, choiceId)

    if (attendee === null) {
      throw new Error("Attendee not found, this should not happen seeing that it was just updated.")
    }
    return attendee
  }

  async registerForEvent(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.userService.getUserById(userId)

    if (user === undefined) {
      throw new Error("User not found")
    }

    const userAlreadyRegistered = await this.attendeeRepository.getByUserId(userId, attendanceId)
    if (userAlreadyRegistered !== null) {
      throw new Error("User is already registered")
    }

    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)
    const poolWithMatchingCriteria = pools.find((pool) => {
      const year = user.studyYear
      return pool.yearCriteria.includes(year)
    })

    if (poolWithMatchingCriteria === undefined) {
      throw new Error("User does not match any pool")
    }

    const attendee = await this.attendeeRepository.create({
      attendancePoolId: poolWithMatchingCriteria.id,
      userId,
      attended: false,
      extrasChoices: null,
    })
    return attendee
  }

  async deregisterForEvent(id: AttendeeId) {
    await this.attendeeRepository.delete(id)
  }

  async getByAttendanceId(attendanceId: string) {
    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    return attendees
  }
}
