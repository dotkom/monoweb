import {
  type Attendance,
  type AttendanceId,
  AttendancePool,
  type AttendanceWrite,
  Attendee,
  Extras,
  WaitlistAttendee,
} from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import {
  AttendanceNotFound,
  AttendanceValidationError,
  CantDeleteAttendanceError,
  ExtrasUpdateAfterRegistrationStartError,
  InvalidParametersError,
} from "./attendance-error"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendanceRepository } from "./attendance-repository"
import { AttendeeRepository } from "./attendee-repository"
import { WaitlistAttendeRepository } from "./waitlist-attendee-repository"

type MergeReturn = {
  attendance: Attendance
  pool: AttendancePool
  waitlistAttendees: WaitlistAttendee[]
  attendees: Attendee[]
}

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]): Promise<MergeReturn>
  updateExtras(id: AttendanceId, extras: Extras[], now?: Date): Promise<Attendance | null>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly waitlistAttendeeRepository: WaitlistAttendeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository
  ) {}

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId) {
    const attendance = await this.attendanceRepository.update(obj, id)
    return attendance
  }

  async updateExtras(id: AttendanceId, extras: Extras[], now: Date = new Date()) {
    const attendance = await this.attendanceRepository.getById(id)

    if (!attendance) {
      throw new AttendanceNotFound(id)
    }

    if (attendance.registerStart < now) {
      throw new ExtrasUpdateAfterRegistrationStartError()
    }

    return this.attendanceRepository.update(
      {
        ...attendance,
        extras,
      },
      id
    )
  }

  /**
   * Creates a new attendance record.
   * Validates dates according to the following rules:
   * registerStart < registerEnd
   *
   */
  async create(obj: AttendanceWrite) {
    // registerStart < registerEnd
    if (obj.registerStart > obj.registerEnd) {
      throw new AttendanceValidationError("Register start must be before register end")
    }

    const attendance = await this.attendanceRepository.create(obj)

    return attendance
  }

  async delete(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new CantDeleteAttendanceError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  async merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]): Promise<MergeReturn> {
    const attendance = await this.attendanceRepository.getById(attendanceId)
    if (attendance === null) {
      throw new InvalidParametersError("Attendance not found")
    }

    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)
    // Create a merge pool with combined capacities and rules

    const combinedCapacity = pools.reduce((acc, pool) => acc + pool.capacity, 0)
    const combinedCriteria = Array.from(new Set(pools.flatMap((pool) => pool.yearCriteria)))

    // if the new pool does not contain all year criteria, throw an error
    if (combinedCriteria.length !== 7) {
      let invalid = false
      for (const i of combinedCriteria) {
        if (!yearCriteria.includes(i)) {
          invalid = true
          break
        }
      }

      if (invalid) {
        throw new InvalidParametersError(
          `Merge pool must contain the combined year criteria of the pools being merged (${combinedCriteria.join(",")})`
        )
      }
    }

    const insert = await this.attendancePoolRepository.create({
      attendanceId,
      capacity: combinedCapacity,
      yearCriteria: yearCriteria,
      title: mergePoolTitle,
      isVisible: true,
      type: "MERGE",
    })

    // Get the number of attendees in the new pool
    const mergePool = await this.attendancePoolRepository.get(insert.id)

    if (mergePool === null) {
      throw new IllegalStateError("Pool not found after insert")
    }

    // move all attendees to the new pool, sort by registration time
    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const combinedAttendees = attendees.sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())

    for (let i = 0; i < combinedAttendees.length; i++) {
      const attendee = combinedAttendees[i]
      await this.attendeeRepository.update({ attendancePoolId: mergePool.id }, attendee.id)
    }

    // move all waitlist attendees to the new pool, sort by position value
    const waitlistAttendees = await this.waitlistAttendeeRepository.getByAttendanceId(attendanceId)
    const combinedWaitlistAttendees = waitlistAttendees.sort((a, b) => a.position - b.position)

    for (let i = 0; i < combinedWaitlistAttendees.length; i++) {
      const waitlistAttendee = combinedWaitlistAttendees[i]

      await this.waitlistAttendeeRepository.update(
        {
          attendanceId,
          position: i,
          attendancePoolId: mergePool.id,
          name: waitlistAttendee.name,
        },
        waitlistAttendee.id
      )
    }

    // delete the old pools
    for (let i = 0; i < pools.length; i++) {
      await this.attendancePoolRepository.update({ isVisible: false }, pools[i].id)
    }

    return {
      attendance: attendance,
      pool: mergePool,
      attendees: combinedAttendees,
      waitlistAttendees: combinedWaitlistAttendees,
    }
  }
}
