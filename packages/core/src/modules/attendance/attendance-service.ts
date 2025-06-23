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
import { addHours, differenceInMinutes, isAfter, isBefore, isFuture } from "date-fns"
import type { JobService } from "../job/job-service"
import { AttendanceDeletionError, AttendanceNotFound, AttendanceValidationError } from "./attendance-error"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"
import type { AttendeeService } from "./attendee-service"

const areSelectionsEqual = (a: AttendanceSelection, b: AttendanceSelection) => {
  if (a.id !== b.id) return false
  if (a.name !== b.name) return false
  if (a.options.length !== b.options.length) return false

  return a.options.every((aOption) => {
    const bOption = b.options.find((bOption) => bOption.id === aOption.id)

    return bOption?.name === aOption.name
  })
}

export interface AttendanceService {
  create(data: AttendanceWrite): Promise<Attendance>
  delete(attendanceId: AttendanceId): Promise<void>
  getById(attendanceId: AttendanceId): Promise<Attendance>
  update(attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>
  mergeAttendancePools(
    attendanceId: AttendanceId,
    newMergePoolData: Partial<AttendancePoolWrite>,
    mergeTime?: Date
  ): Promise<void>
  getSelectionsResponseSummary(attendanceId: AttendanceId): Promise<SelectionResponseSummary[]>
  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(attendancePoolId: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
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

  private async validateRegisterTime(registerStart: Date, registerEnd: Date) {
    if (!isAfter(registerEnd, registerStart) || differenceInMinutes(registerEnd, registerStart) < 1) {
      throw new AttendanceValidationError("Register end must be at least one minute after register start")
    }
  }

  private async validateSelections(
    attendanceId: AttendanceId,
    currentSelections: AttendanceSelection[],
    newSelections: AttendanceSelection[]
  ) {
    const updatedSelections = currentSelections.filter((currentSelection) => {
      const newSelection = newSelections.find((newSelection) => newSelection.id === currentSelection.id)

      return newSelection && !areSelectionsEqual(currentSelection, newSelection)
    })

    await Promise.all(
      updatedSelections.map(async (selection) =>
        this.attendeeRepository.removeAllSelectionResponsesForSelection(attendanceId, selection.id)
      )
    )
  }

  public async create(data: AttendanceWrite) {
    await this.validateRegisterTime(data.registerStart, data.registerEnd)

    return await this.attendanceRepository.create(data)
  }

  public async getById(attendanceId: AttendanceId) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    return attendance
  }

  public async delete(attendanceId: AttendanceId) {
    const poolHasAttendees = await this.attendeeRepository.attendanceHasAttendees(attendanceId)

    if (poolHasAttendees) {
      throw new AttendanceDeletionError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(attendanceId)
  }

  public async update(attendanceId: AttendanceId, data: Partial<AttendanceWrite>) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    if (data.registerStart || data.registerEnd) {
      const registerStart = data.registerStart || attendance.registerStart
      const registerEnd = data.registerEnd || attendance.registerEnd

      this.validateRegisterTime(registerStart, registerEnd)
    }

    if (data.selections) {
      this.validateSelections(attendanceId, attendance.selections, data.selections)
    }

    return await this.attendanceRepository.update(attendanceId, data)
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
      const result = await this.attendeeService.attemptReserve(attendee, newPool, { bypassCriteria: false })
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

  private canPoolMerge(registerStart: Date, poolMergeDelayHours: number | null, now = new Date()) {
    if (poolMergeDelayHours === null) {
      return true
    }

    const poolMergeEligibleAt = addHours(registerStart, poolMergeDelayHours)

    return !isBefore(now, poolMergeEligibleAt)
  }

  private async _mergeAttendancePools(attendanceId: AttendanceId, newMergePoolData: Partial<AttendancePoolWrite>) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    const poolsToMerge = attendance.pools.filter((pool) =>
      this.canPoolMerge(attendance.registerStart, pool.mergeDelayHours)
    )

    if (poolsToMerge.length === 0) {
      return
    }

    const combinedYearCriteria = poolsToMerge.flatMap((pool) => pool.yearCriteria)
    const newYearCriteria = newMergePoolData.yearCriteria ?? []
    const yearCriteria = [...new Set([...combinedYearCriteria, ...newYearCriteria])]

    const combinedPoolCapacity = poolsToMerge.reduce((sum, pool) => sum + pool.capacity, 0)
    const capacity = Math.max(newMergePoolData.capacity || 0, combinedPoolCapacity)

    const newMergePool = await this.attendanceRepository.createPool({
      attendanceId,
      title: newMergePoolData.title ?? "Merged pool",
      mergeDelayHours: null,
      yearCriteria,
      capacity,
    })

    const poolsToMergeIds = poolsToMerge.map((pool) => pool.id)
    await this.attendeeRepository.moveFromMultiplePoolsToPool(poolsToMergeIds, newMergePool.id)

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
