import {
  AttendeeUserSchema,
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  type AttendeeUser,
  type AttendeeWithUser,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import { type UserService } from "../../user/user-service"
import { AttendanceRepository } from "../repositories"

export interface _AttendeeService {
  getByPoolId(poolId: AttendancePoolId): Promise<Pick<Attendee, "user">[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<AttendeeWithUser>
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<Attendee>
  registerForEvent(userId: string, poolId: string): Promise<Attendee>
  deregisterForEvent(id: AttendeeId): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<AttendeeUser[]>
}

export class _AttendeeServiceImpl implements _AttendeeService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly userService: UserService
  ) {
    this.attendanceRepository = attendanceRepository
    this.userService = userService
  }

  async create(obj: AttendeeWrite): Promise<Attendee> {
    return this.attendanceRepository.attendee.create(obj)
  }

  async delete(id: AttendeeId): Promise<void> {
    await this.attendanceRepository.attendee.delete(id)
  }

  async getByPoolId(poolId: AttendancePoolId) {
    return this.attendanceRepository.attendee.getByPoolId(poolId)
  }

  async updateAttended(attended: boolean, id: AttendeeId): Promise<AttendeeWithUser> {
    const res = await this.attendanceRepository.attendee.update({ attended }, id)
    if (res.numUpdatedRows === 1) {
      const attendee = await this.attendanceRepository.attendee.getById(id)
      const idpUser = await this.userService.getUserById(attendee.userId)

      if (idpUser === undefined) {
        throw new Error("User not found")
      }

      return {
        ...attendee,
        ...idpUser,
      }
    }

    throw new Error("TODO: decide on how to handle the case where the update fails")
  }

  async updateExtraChoices(id: AttendanceId, questionId: string, choiceId: string): Promise<Attendee> {
    const res = await this.attendanceRepository.attendee.updateExtraChoices(id, questionId, choiceId)

    if (res.numUpdatedRows === 1) {
      return this.attendanceRepository.attendee.getById(id)
    }

    throw new Error("TODO: decide on how to handle the case where the update fails")
  }

  async registerForEvent(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.userService.getUserById(userId)

    if (user === undefined) {
      throw new Error("User not found")
    }

    const userAlreadyRegistered = await this.attendanceRepository.attendee.getByUserId(userId, attendanceId)
    console.log("already registered", userAlreadyRegistered)
    console.log(userId, attendanceId)
    if (userAlreadyRegistered !== undefined) {
      throw new Error("User is already registered")
    }

    const pools = await this.attendanceRepository.pool.getByAttendanceId(attendanceId)
    const poolWithMatchingCriteria = pools.find((pool) => {
      const year = user.studyYear
      return pool.yearCriteria.includes(year)
    })

    console.log(pools, poolWithMatchingCriteria, user.studyYear)
    console.log(user)

    if (poolWithMatchingCriteria === undefined) {
      throw new Error("User does not match any pool")
    }

    const attendee = await this.attendanceRepository.attendee.create({
      attendancePoolId: poolWithMatchingCriteria.id,
      userId,
      attended: false,
      extrasChoices: null,
    })
    return attendee
  }

  async deregisterForEvent(id: AttendeeId) {
    await this.attendanceRepository.attendee.delete(id)
  }

  async getByAttendanceId(attendanceId: string) {
    const attendees = await this.attendanceRepository.attendee.getByAttendanceId(attendanceId)
    const idpUsers = await this.userService.getUserBySubjectIDP(attendees.map(({ user }) => user.auth0Sub))

    return attendees.map((user) => {
      const idpUser = idpUsers.find((idpUser) => idpUser.subject === user.user.auth0Sub)
      return AttendeeUserSchema.parse({
        ...user,
        user: {
          ...user.user,
          ...idpUser,
        },
      })
    })
  }
}
