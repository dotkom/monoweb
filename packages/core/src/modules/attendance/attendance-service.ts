import type { DBHandle } from "@dotkomonline/db"
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
  create(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  delete(handle: DBHandle, attendanceId: AttendanceId): Promise<void>
  getById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance>
  getByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Map<AttendanceId, Attendance>>
  update(handle: DBHandle, attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>
  mergeAttendancePools(
    handle: DBHandle,
    attendanceId: AttendanceId,
    newMergePoolData: Partial<AttendancePoolWrite>,
    mergeTime?: Date
  ): Promise<void>
  getSelectionsResponseSummary(handle: DBHandle, attendanceId: AttendanceId): Promise<SelectionResponseSummary[]>
  createPool(handle: DBHandle, data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId,
    data: Partial<AttendancePoolWrite>
  ): Promise<AttendancePool>
}

export function getAttendanceService(
  attendanceRepository: AttendanceRepository,
  attendeeRepository: AttendeeRepository,
  attendeeService: AttendeeService,
  jobService: JobService
): AttendanceService {
  async function validateSelections(
    handle: DBHandle,
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
        attendeeRepository.removeAllSelectionResponsesForSelection(attendanceId, selection.id)
      )
    )
  }
  async function attemptReserveAttendeesOnCapacityChange(
    handle: DBHandle,
    oldCapacity: number,
    newPool: AttendancePool
  ) {
    const capacityDifference = newPool.capacity - oldCapacity

    if (capacityDifference <= 0) {
      return
    }

    const attendees = await attendeeService.getByAttendancePoolId(newPool.id) // These are in order of reserveTime
    const unreservedAttendees = attendees.filter((attendee) => !attendee.reserved)
    const toAttemptReserve = unreservedAttendees.slice(0, capacityDifference)

    for (const attendee of toAttemptReserve) {
      const result = await attendeeService.attemptReserve(attendee, newPool, { bypassCriteria: false })
      // reserveTime and pool capacity are the only metrics we use to reserve. If one fail the next will also fail
      if (!result) {
        break
      }
    }
  }
  function canPoolMerge(registerStart: Date, poolMergeDelayHours: number | null, now = new Date()) {
    if (poolMergeDelayHours === null) {
      return true
    }

    const poolMergeEligibleAt = addHours(registerStart, poolMergeDelayHours)

    return !isBefore(now, poolMergeEligibleAt)
  }
  return {
    async create(handle, data: AttendanceWrite) {
      validateRegisterTime(data.registerStart, data.registerEnd)
      return await attendanceRepository.create(handle, data)
    },
    async delete(handle, attendanceId: AttendanceId) {
      const poolHasAttendees = await attendeeRepository.attendanceHasAttendees(attendanceId)
      if (poolHasAttendees) {
        throw new AttendanceDeletionError("Cannot delete attendance with attendees")
      }
      await attendanceRepository.delete(handle, attendanceId)
    },
    async getById(handle, attendanceId: AttendanceId) {
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      return attendance
    },
    async getByIds(handle, attendanceIds: AttendanceId[]) {
      const attendances = await attendanceRepository.getByIds(handle, attendanceIds)
      if (attendances.size !== attendanceIds.length) {
        const missingIds = attendanceIds.filter((id) => !attendances.has(id))
        throw new AttendanceNotFound(missingIds.join(", "))
      }
      return attendances
    },
    async update(handle, attendanceId: AttendanceId, data: Partial<AttendanceWrite>) {
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }

      if (data.registerStart || data.registerEnd) {
        const registerStart = data.registerStart || attendance.registerStart
        const registerEnd = data.registerEnd || attendance.registerEnd

        validateRegisterTime(registerStart, registerEnd)
      }

      if (data.selections) {
        await validateSelections(handle, attendanceId, attendance.selections, data.selections)
      }

      return await attendanceRepository.update(handle, attendanceId, data)
    },
    async mergeAttendancePools(handle, attendanceId, newMergePoolData, mergeTime = new Date()) {
      if (!mergeTime || !isFuture(mergeTime)) {
        const attendance = await attendanceRepository.getById(handle, attendanceId)
        if (!attendance) {
          throw new AttendanceNotFound(attendanceId)
        }
        const poolsToMerge = attendance.pools.filter((pool) =>
          canPoolMerge(attendance.registerStart, pool.mergeDelayHours)
        )
        if (poolsToMerge.length === 0) {
          return
        }

        const combinedYearCriteria = poolsToMerge.flatMap((pool) => pool.yearCriteria)
        const newYearCriteria = newMergePoolData.yearCriteria ?? []
        const yearCriteria = [...new Set([...combinedYearCriteria, ...newYearCriteria])]
        const combinedPoolCapacity = poolsToMerge.reduce((sum, pool) => sum + pool.capacity, 0)
        const capacity = Math.max(newMergePoolData.capacity || 0, combinedPoolCapacity)
        const newMergePool = await attendanceRepository.createPool(handle, {
          attendanceId,
          title: newMergePoolData.title ?? "Merged pool",
          mergeDelayHours: null,
          yearCriteria,
          capacity,
        })

        const poolsToMergeIds = poolsToMerge.map((pool) => pool.id)
        await attendeeRepository.moveFromMultiplePoolsToPool(poolsToMergeIds, newMergePool.id)

        for (const pool of poolsToMerge) {
          await attendanceRepository.deletePool(handle, pool.id)
        }
      }

      await jobService.scheduleMergePoolsJob(handle, mergeTime, { attendanceId, newMergePoolData })
    },
    async getSelectionsResponseSummary(handle, attendanceId) {
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      const attendees = await attendeeRepository.getByAttendanceId(attendanceId)
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
    },
    async createPool(handle, data: AttendancePoolWrite) {
      return await attendanceRepository.createPool(handle, data)
    },
    async deletePool(handle, attendancePoolId) {
      if (await attendeeRepository.poolHasAttendees(attendancePoolId)) {
        throw new AttendanceDeletionError("Cannot delete attendance pool with attendees")
      }
      return await attendanceRepository.deletePool(handle, attendancePoolId)
    },
    async updatePool(handle, attendancePoolId, data) {
      const currentPool = await attendanceRepository.getPoolById(handle, attendancePoolId)
      if (!currentPool) {
        throw new AttendancePoolNotFoundError(attendancePoolId)
      }

      const newPool = await attendanceRepository.updatePool(handle, attendancePoolId, data)
      if (data.capacity) {
        await attemptReserveAttendeesOnCapacityChange(handle, currentPool.capacity, newPool)
      }

      return newPool
    },
  }
}

function validateRegisterTime(registerStart: Date, registerEnd: Date) {
  if (!isAfter(registerEnd, registerStart) || differenceInMinutes(registerEnd, registerStart) < 1) {
    throw new AttendanceValidationError("Register end must be at least one minute after register start")
  }
}
