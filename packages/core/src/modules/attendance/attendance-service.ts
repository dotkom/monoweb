import { type Database } from "@dotkomonline/db"
import {
  type AttendancePoolWithNumAttendees,
  AttendeeUserSchema,
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceWrite,
  type Attendee,
  type AttendeeId,
  type AttendeeUser,
  type AttendeeWithUser,
  type AttendeeWrite,
  type EventId,
  type UserId,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  type WaitlistAttendeeWrite,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type AttendanceRepository } from "./attendance-repository"
import { type UserService } from "../user/user-service"

interface _AttendanceService {
  create(obj: Partial<AttendanceWrite>, eventId: EventId): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | undefined>
  getByEventId(id: EventId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
}

interface _AttendancePoolService {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  getByAttendanceId(id: string): Promise<AttendancePoolWithNumAttendees[]>
}

interface _WaitlistAttendeService {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
}

interface _AttendeeService {
  getByPoolId(poolId: AttendancePoolId): Promise<Pick<Attendee, "user">[]>
  updateAttended(attended: boolean, id: AttendeeId): Promise<AttendeeWithUser>
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<Attendee>
  registerForEvent(userId: string, poolId: string): Promise<Attendee>
  deregisterForEvent(id: AttendeeId): Promise<void>
  getByAttendanceId(attendanceId: string): Promise<AttendeeUser[]>
}

export interface AttendanceService {
  attendance: _AttendanceService
  pool: _AttendancePoolService
  waitlistAttendee: _WaitlistAttendeService
  attendee: _AttendeeService
  // dashboardUC: DashboardAttendanceUC
}

class _AttendanceServiceImpl implements _AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async update(obj: AttendanceWrite, id: AttendanceId): Promise<Attendance> {
    const res = await this.attendanceRepository.attendance.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const attendance = await this.attendanceRepository.attendance.getById(id)
      if (attendance === undefined) {
        throw new Error("Attendance not found")
      }
      return attendance
    }

    throw new Error("TODO: decide on how to handle the case where the update fails")
  }

  async create(obj: Partial<AttendanceWrite>, id: EventId): Promise<Attendance> {
    return this.attendanceRepository.attendance.create({
      eventId: id,
      ...obj,
    })
  }

  async delete(id: AttendanceId): Promise<void> {
    await this.attendanceRepository.attendance.delete(id)
  }

  async getById(id: AttendanceId): Promise<Attendance | undefined> {
    return this.attendanceRepository.attendance.getById(id)
  }

  async getByEventId(id: EventId) {
    const result = await this.attendanceRepository.attendance.getByEventId(id)
    if (result === undefined) {
      return null
    }

    return result
  }
}
class _PoolServiceImpl implements _AttendancePoolService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendanceRepository.pool.getByAttendanceId(id)
  }

  async create(obj: AttendancePoolWrite): Promise<AttendancePool> {
    const res = await this.attendanceRepository.pool.create(obj)
    console.log(res)
    return res
  }

  async delete(id: AttendancePoolId): Promise<void> {
    await this.attendanceRepository.pool.delete(id)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool> {
    const res = await this.attendanceRepository.pool.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const pool = await this.attendanceRepository.pool.get(id)
      if (pool === undefined) {
        throw new Error("Pool not found")
      }
      return pool
    }

    throw new Error("TODO: decide on how to handle the case where the update fails")
  }

  async getPoolsByAttendanceId(attendanceId: string): Promise<AttendancePool[]> {
    return this.attendanceRepository.pool.getByAttendanceId(attendanceId)
  }
}

class _WaitlistAttendeServiceImpl implements _WaitlistAttendeService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return this.attendanceRepository.waitlistAttendee.create(obj)
  }

  async delete(id: WaitlistAttendeeId): Promise<void> {
    await this.attendanceRepository.waitlistAttendee.delete(id)
  }
}

class _AttendeeServiceImpl implements _AttendeeService {
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
      console.log("----------------IDP--------------")
      console.log(idpUser)
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

// export interface DashboardAttendanceUC {
//   // getAttendanceInfo(id: EventId): Promise<AttendancePoolWithNumAttendees>
//   getAttendees(attendanceId: string): Promise<AttendeeWithUser[]>
// }
// class DashboardUCImpl implements DashboardAttendanceUC {
//   // attendanceRepository: AttendanceRepository = {} as AttendanceRepository
//   // userService: UserService = {} as UserService
//   constructor(
//     private readonly db: Kysely<Database>,
//     private readonly attendanceRepository: AttendanceRepository,
//     private readonly userService: UserService
//   ) {
//     this.db = db
//     this.attendanceRepository = attendanceRepository
//     this.userService = userService
//   }

//   async getAttendees(attendanceId: AttendanceId): Promise<AttendeeWithUser[]> {
//     const dbUsers = (
//       await this.db
//         .selectFrom("attendee")
//         .leftJoin("owUser", "owUser.id", "attendee.userId")
//         .selectAll("owUser")
//         .selectAll("attendee")

//         .leftJoin("attendancePool", "attendancePool.id", "attendee.attendancePoolId")
//         .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
//         .where("attendance.id", "=", attendanceId)
//         .execute()
//     ).map((user) => ({
//       ...user,
//       extrasChoices: user.extrasChoices ? JSON.parse(user.extrasChoices as string) : null,
//     }))

//     const idpUsers = await this.userService.getUserBySubjectIDP(dbUsers.map((user) => user.auth0Sub as string))

//     return dbUsers.map((user) => {
//       const idpUser = idpUsers.find((idpUser) => idpUser.subject === user.auth0Sub)
//       return AttendeesWithUser.parse({
//         ...user,
//         ...idpUser,
//       })
//     })
//   }
// }

// Main service for all of the attendance domain
export class AttendanceServiceImpl implements AttendanceService {
  attendance: _AttendanceService
  pool: _AttendancePoolService
  waitlistAttendee: _WaitlistAttendeService
  attendee: _AttendeeService
  // dashboardUC: DashboardAttendanceUC

  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly db: Kysely<Database>,
    private readonly userService: UserService
  ) {
    this.attendance = new _AttendanceServiceImpl(attendanceRepository)
    this.pool = new _PoolServiceImpl(attendanceRepository)
    this.waitlistAttendee = new _WaitlistAttendeServiceImpl(attendanceRepository)
    this.attendee = new _AttendeeServiceImpl(attendanceRepository, userService)
    // this.dashboardUC = new DashboardUCImpl(db, attendanceRepository, userService)
  }
}
