import type {
  Attendance,
  AttendanceId,
  AttendancePool,
  AttendancePoolId,
  AttendancePoolWrite,
  AttendanceSelection,
  AttendanceWrite,
  AttendanceSelectionResults as SelectionResponseSummary,
} from "@dotkomonline/types"
import { addHours, isFuture } from "date-fns"
import type { JobService } from "../job/job-service"
import { AttendanceDeletionError, AttendanceNotFound, AttendanceValidationError } from "./attendance-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"
import type { AttendeeService } from "./attendee-service"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance>
  update(id: AttendanceId, obj: Partial<AttendanceWrite>): Promise<Attendance>
  mergeAttendancePools(
    attendanceId: AttendanceId,
    newMergePoolData: Partial<AttendancePoolWrite>,
    mergeTime?: Date
  ): Promise<void>
  getSelectionsResponseSummary(attendanceId: AttendanceId): Promise<SelectionResponseSummary[]>
  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(poolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
}

export class AttendanceServiceImpl implements AttendanceService {
  private readonly attendanceRepository: AttendanceRepository
  private readonly attendeeRepository: AttendeeRepository
  private readonly attendeeService: AttendeeService
  private readonly jobService: JobService

  constructor(
    attendanceRepository: AttendanceRepository,
    attendeeRepository: AttendeeRepository,
    attendeeService: AttendeeService,
    jobService: JobService
  ) {
    this.attendanceRepository = attendanceRepository
    this.attendeeRepository = attendeeRepository
    this.attendeeService = attendeeService
    this.jobService = jobService
  }

  public async getSelectionsResponseSummary(attendanceId: AttendanceId) {
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

  public async create(obj: AttendanceWrite) {
    if (obj.registerStart > obj.registerEnd) {
      throw new AttendanceValidationError("Register start must be before register end")
    }

    return await this.attendanceRepository.create(obj)
  }

  public async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  public async delete(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new AttendanceDeletionError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  public async update(id: AttendanceId, data: Partial<AttendanceWrite>) {
    if (data.registerStart || data.registerEnd) {
      const existingData = await this.getById(id)
      if ((data.registerStart || existingData.registerStart) > (data.registerEnd || existingData.registerEnd)) {
        throw new AttendanceValidationError("Register start must be before register end")
      }
    }

    // Remove attendees selected options from edited selections
    if (data.selections) {
      const isIdentical = (a: AttendanceSelection, b: AttendanceSelection) => {
        if (a.id !== b.id) return false
        if (a.name !== b.name) return false
        if (a.options.length !== b.options.length) return false

        return a.options.every((aOption) => {
          const bOption = b.options.find((bOption) => bOption.id === aOption.id)

          return bOption?.name === aOption.name
        })
      }

      const { selections: oldSelections } = await this.getById(id)

      const updatedSelections = data.selections.filter((newSelection) => {
        const oldSelection = oldSelections.find((oldSelection) => oldSelection.id === newSelection.id)

        return oldSelection && !isIdentical(oldSelection, newSelection)
      })

      await Promise.all(
        updatedSelections.map(async (selection) =>
          this.attendeeRepository.removeAllSelectionResponsesForSelection(id, selection.id)
        )
      )
    }

    return await this.attendanceRepository.update(data, id)
  }

  public async createPool(data: AttendancePoolWrite) {
    return await this.attendanceRepository.createPool(data)
  }

  public async deletePool(poolId: AttendancePoolId) {
    if (await this.attendeeRepository.poolHasAttendees(poolId)) {
      throw new AttendanceDeletionError("Cannot delete attendance pool with attendees")
    }

    return await this.attendanceRepository.deletePool(poolId)
  }

  private async attemptReserveAttendeesOnCapacityChange(oldCapacity: number, newPool: AttendancePool) {
    const capacityDifference = newPool.capacity - oldCapacity

    if (capacityDifference <= 0) {
      return
    }

    const attendees = await this.attendeeService.getByAttendancePoolId(newPool.id) // These are in order of reserveTime
    const unreservedAttendees = attendees.filter((attendee) => !attendee.reserved)
    const toAttemptReserve = unreservedAttendees.slice(0, capacityDifference)

    for (const attendee of toAttemptReserve) {
      const result = await this.attendeeService.attemptReserve(attendee, newPool)
      // reserveTime and pool capacity are the only metrics we use to reserve. If one fail the next will also fail
      if (!result) {
        break
      }
    }
  }

  public async updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    const currentPool = await this.attendanceRepository.getPoolById(poolId)

    if (!currentPool) {
      throw new AttendancePoolNotFoundError(poolId)
    }

    const newPool = await this.attendanceRepository.updatePool(poolId, data)

    if (data.capacity) {
      await this.attemptReserveAttendeesOnCapacityChange(currentPool.capacity, newPool)
    }

    return newPool
  }

  private canPoolMerge(pool: AttendancePool, attendance: Attendance, mergeTime: Date) {
    if (pool.mergeDelayHours === null) {
      return true
    }

    return addHours(attendance.registerStart, pool.mergeDelayHours) > mergeTime
  }

  private async _mergeAttendancePools(attendanceId: AttendanceId, newMergePoolData: Partial<AttendancePoolWrite>) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    const poolsToMerge = attendance.pools.filter((pool) => this.canPoolMerge(pool, attendance, new Date()))

    if (poolsToMerge.length === 0) {
      return
    }

    const minCapacity = poolsToMerge.reduce((sum, pool) => sum + pool.capacity, 0)

    const mergedPool = await this.attendanceRepository.createPool({
      attendanceId,
      title: newMergePoolData.title ?? "Merged pool",
      mergeDelayHours: null,
      yearCriteria: Array.from(
        new Set([...poolsToMerge.flatMap((pool) => pool.yearCriteria), ...(newMergePoolData.yearCriteria ?? [])])
      ),
      capacity: Math.max(newMergePoolData.capacity || 0, minCapacity),
    })

    const poolsToMergeIds = poolsToMerge.map((pool) => pool.id)
    await this.attendeeRepository.moveFromMultiplePoolsToPool(poolsToMergeIds, mergedPool.id)

    for (const pool of poolsToMerge) {
      await this.attendanceRepository.deletePool(pool.id)
    }
  }

  public async mergeAttendancePools(
    attendanceId: AttendanceId,
    newMergePoolData: Partial<AttendancePoolWrite>,
    mergeTime?: Date
  ) {
    if (!mergeTime || !isFuture(mergeTime)) {
      return await this._mergeAttendancePools(attendanceId, newMergePoolData)
    }

    await this.jobService.scheduleMergePoolsJob(mergeTime, { attendanceId, newMergePoolData })
  }
}
