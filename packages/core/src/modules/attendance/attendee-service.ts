import type { DBClient } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendanceSelectionResponse,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  type QrCodeRegistrationAttendee,
  type UserId,
  canDeregisterForAttendance as attendanceOpenForDeregistration,
  canRegisterForAttendance as attendanceOpenForRegistration,
  canUserAttendPool,
} from "@dotkomonline/types"
import { addHours } from "date-fns"
import { AttendeeNotFoundError } from "../event/attendee-error"
import { UserNotFoundError } from "../user/user-error"
import type { UserService } from "../user/user-service"
import { AttendanceDeregisterClosedError, AttendanceNotOpenError } from "./attendance-error"
import { AttendancePoolNotFoundError, AttendancePoolValidationError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"

export interface AttendeeService {
  registerForEvent(userId: string, attendanceId: string, attendancePoolId: string): Promise<Attendee>
  deregisterForEvent(userId: string, attendanceId: string): Promise<void>
  adminDeregisterForEvent(id: AttendeeId): Promise<void>
  updateSelectionResponses(id: AttendanceId, responses: AttendanceSelectionResponse[]): Promise<Attendee>
  getByAttendanceId(attendanceId: string): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<Attendee>
  tryReserve(attendeeId: AttendeeId, pool: AttendancePool): Promise<Attendee | false>
  handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId): Promise<QrCodeRegistrationAttendee>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeServiceImpl implements AttendeeService {
  private readonly attendeeRepository: AttendeeRepository
  private readonly attendanceRepository: AttendanceRepository
  private readonly userService: UserService
  private readonly db: DBClient

  constructor(
    attendeeRepository: AttendeeRepository,
    attendanceRepository: AttendanceRepository,
    userService: UserService,
    db: DBClient
  ) {
    this.attendeeRepository = attendeeRepository
    this.attendanceRepository = attendanceRepository
    this.userService = userService
    this.db = db
  }

  async create(obj: AttendeeWrite) {
    return this.attendeeRepository.create(obj)
  }

  async delete(id: AttendeeId) {
    await this.attendeeRepository.delete(id)
  }

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    return await this.attendeeRepository.getByUserId(userId, attendanceId)
  }

  async updateAttended(attended: boolean, id: AttendeeId) {
    const attendee = await this.attendeeRepository.update(id, { attended })
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
    await this.attendeeRepository.update(attendee.id, { attended: true })

    return { attendee, user, alreadyAttended: false }
  }

  async updateSelectionResponses(id: AttendeeId, selections: AttendanceSelectionResponse[]) {
    const attendee = await this.attendeeRepository.update(id, { selections })

    if (attendee === null) {
      throw new AttendeeNotFoundError(id)
    }

    return attendee
  }

  async registerForEvent(userId: UserId, attendanceId: AttendancePoolId, attendancePoolId: AttendanceId) {
    const user = await this.userService.getById(userId)
    const attendance = await this.attendanceRepository.getById(attendanceId)
    const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)

    if (attendancePool === undefined) {
      throw new AttendancePoolNotFoundError("Tried to register to unknown attendance pool")
    }

    const registerTime = new Date()

    if (!attendanceOpenForRegistration(attendance, registerTime)) {
      throw new AttendanceNotOpenError()
    }

    // TODO: Use user service to get membership grade
    const userGrade = 1

    if (!canUserAttendPool(attendancePool, user)) {
      throw new AttendancePoolValidationError("User does not qualify for pool")
    }

    let reserveDelayHours = 0

    // TODO: Use mark service to get delay because of mark
    reserveDelayHours += 0

    // If the pool has a merge delay the reserve time is pushed
    reserveDelayHours +=
      attendancePool.capacity === 0 && attendancePool.mergeDelayHours ? attendancePool.mergeDelayHours : 0

    const reserveTime = addHours(registerTime, reserveDelayHours)

    const attendee = await this.attendeeRepository.create({
      userId,
      attendancePoolId,
      attendanceId: attendancePool.attendanceId,

      displayName: (user.firstName && user.lastName) ?? user.email,
      userGrade: userGrade,

      reserveTime,
      reserved: false,
    })

    console.log("reserve delay hours:", reserveDelayHours)

    if (reserveDelayHours === 0) {
      const reservedAttendee = await this.tryReserve(attendee.id, attendancePool)

      if (reservedAttendee) {
        return reservedAttendee
      }
    }

    return attendee
  }

  /** Tries to reserve a spot for an attendee, failing if there is no free pool capacity */
  async tryReserve(attendeeId: AttendeeId, pool: AttendancePool): Promise<Attendee | false> {
    if (pool.numAttendees < pool.capacity) {
      return await this.attendeeRepository.update(attendeeId, { reserved: true })
    }

    return false
  }

  async deregisterForEvent(userId: string, attendanceId: AttendanceId) {
    const deregisterTime = new Date()

    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendanceOpenForDeregistration(attendance, deregisterTime)) {
      throw new AttendanceDeregisterClosedError()
    }

    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)

    if (attendee === null) {
      throw new AttendeeNotFoundError("Could not deregister because not registered")
    }

    await this.attendeeRepository.delete(attendee.id)

    const attendedPool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
    const poolIsFull = attendedPool && attendedPool.numAttendees >= attendedPool.capacity

    if (attendee.reserved && poolIsFull) {
      const nextUnreservedAttendee = await this.attendeeRepository.getFirstUnreservedByAttendancePoolId(attendedPool.id)
      attendedPool.numAttendees -= 1

      if (nextUnreservedAttendee && nextUnreservedAttendee.reserveTime <= new Date()) {
        await this.tryReserve(nextUnreservedAttendee.id, attendedPool)
      }
    }
  }

  async adminDeregisterForEvent(id: AttendeeId) {
    const attendance = await this.attendanceRepository.getByAttendeeId(id)

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
