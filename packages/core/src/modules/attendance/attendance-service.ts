import type {
  Attendance,
  AttendanceId,
  AttendancePool,
  AttendancePoolId,
  AttendancePoolWrite,
  AttendanceWrite,
  AttendanceSelectionResults as SelectionResponseSummary,
} from "@dotkomonline/types"
import { addHours } from "date-fns"
import { AttendanceDeletionError, AttendanceNotFound, AttendanceValidationError } from "./attendance-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance>
  update(id: AttendanceId, obj: Partial<AttendanceWrite>): Promise<Attendance>
  mergeAttendancePools(attendanceId: AttendanceId): Promise<void>
  getSelectionsResponseSummary(attendanceId: AttendanceId): Promise<SelectionResponseSummary[] | null>
  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(poolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
}

export class AttendanceServiceImpl implements AttendanceService {
  private readonly attendanceRepository: AttendanceRepository
  private readonly attendeeRepository: AttendeeRepository

  constructor(
    attendanceRepository: AttendanceRepository,
    attendeeRepository: AttendeeRepository
  ) {
    this.attendanceRepository = attendanceRepository
    this.attendeeRepository = attendeeRepository
  }

  async getSelectionsResponseSummary(attendanceId: AttendanceId) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const allSelectionResponses = attendees.flatMap((attendee) => attendee.selections)

    return attendance.selections.map((selection) => {
      const selectionResponses = allSelectionResponses.filter((response) => response.selectionId === selection.id)

      return {
        id: selection.id,
        name: selection.name,
        totalCount: selectionResponses.length,
        options: selection.options.map((option) => ({
          id: option.id,
          name: option.name,
          count: selectionResponses.filter((response) => response.optionId === option.id).length,
        })),
      }
    })
  }

  async create(obj: AttendanceWrite) {
    if (obj.registerStart > obj.registerEnd) {
      throw new AttendanceValidationError("Register start must be before register end")
    }

    return await this.attendanceRepository.create(obj)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  async delete(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new AttendanceDeletionError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  async update(id: AttendanceId, data: Partial<AttendanceWrite>) {
    if (data.registerStart || data.registerEnd) {
      const existingData = await this.getById(id)
      if ((data.registerStart || existingData.registerStart) > (data.registerEnd || existingData.registerEnd)) {
        throw new AttendanceValidationError("Register start must be before register end")
      }
    }

    const attendance = await this.attendanceRepository.update(data, id)

    return attendance
  }

  async createPool(data: AttendancePoolWrite) {
    return await this.attendanceRepository.createPool(data)
  }

  async deletePool(poolId: AttendancePoolId) {
    if (await this.attendeeRepository.poolHasAttendees(poolId)) {
      throw new AttendanceDeletionError("Cannot delete attendance pool with attendees")
    }

    return await this.attendanceRepository.deletePool(poolId)
  }

  async updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    const pool = await this.attendanceRepository.getPoolById(poolId)

    if (data.capacity && pool.numAttendees > data.capacity) {
      throw new AttendanceValidationError("Cannot change pool capacity to less than the reserved spots")
    }

    return await this.attendanceRepository.updatePool(poolId, data)
  }

  private canPoolMerge(pool: AttendancePool, attendance: Attendance, mergeTime: Date) {
    if (pool.mergeDelayHours === null) {
      return true
    }

    return addHours(attendance.registerStart, pool.mergeDelayHours) > mergeTime
  }

  async mergeAttendancePools(attendanceId: AttendanceId, mergeTime = new Date()) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    const poolsToMerge = attendance.pools.filter((pool) => this.canPoolMerge(pool, attendance, mergeTime))

    if (poolsToMerge.length === 0) {
      return
    }

    const mergedPool = await this.attendanceRepository.createPool({
      attendanceId,
      title: "Merged pool",
      mergeDelayHours: null,
      yearCriteria: poolsToMerge.flatMap((pool) => pool.yearCriteria),
      capacity: poolsToMerge.reduce((sum, pool) => sum + pool.capacity, 0),
    })

    const poolsToMergeIds = poolsToMerge.map((pool) => pool.id)
    await this.attendeeRepository.moveFromMultiplePoolsToPool(poolsToMergeIds, mergedPool.id)

    for (const pool of poolsToMerge) {
      await this.attendanceRepository.deletePool(pool.id)
    }
  }
}
