import { TZDate } from "@date-fns/tz"
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
import { getCurrentUTC, ogJoin, slugify } from "@dotkomonline/utils"
import { addHours, differenceInMinutes, isAfter, isBefore, isFuture } from "date-fns"
import { configuration } from "../../configuration"
import { EventNotFoundError } from "../event/event-error"
import type { EventService } from "../event/event-service"
import type { PaymentService } from "../payment/payment-service"
import {
  type AttemptReserveAttendeeTaskDefinition,
  type ChargeAttendancePaymentsTaskDefinition,
  type InferTaskData,
  type MergePoolsTaskDefinition,
  tasks,
} from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
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
  handleMergePoolsTask(handle: DBHandle, payload: InferTaskData<MergePoolsTaskDefinition>): Promise<void>
  handleAttemptReserveAttendeeTask(
    handle: DBHandle,
    payload: InferTaskData<AttemptReserveAttendeeTaskDefinition>
  ): Promise<void>
  handleChargePaymentTask(
    handle: DBHandle,
    payload: InferTaskData<ChargeAttendancePaymentsTaskDefinition>
  ): Promise<void>
}

export function getAttendanceService(
  attendanceRepository: AttendanceRepository,
  attendeeRepository: AttendeeRepository,
  attendeeService: AttendeeService,
  taskSchedulingService: TaskSchedulingService,
  paymentService: PaymentService,
  eventService: EventService
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
        attendeeRepository.removeAllSelectionResponsesForSelection(handle, attendanceId, selection.id)
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

    const attendees = await attendeeService.getByAttendancePoolId(handle, newPool.id) // These are in order of reserveTime
    const unreservedAttendees = attendees.filter((attendee) => !attendee.reserved)
    const toAttemptReserve = unreservedAttendees.slice(0, capacityDifference)
    const attendance = await attendanceRepository.getById(handle, newPool.attendanceId)
    if (!attendance) {
      throw new AttendanceNotFound(newPool.attendanceId)
    }

    for (const attendee of toAttemptReserve) {
      const result = await attendeeService.attemptReserve(handle, attendee, newPool, attendance, {
        bypassCriteria: false,
      })
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
      if (data.attendancePrice) {
        throw new Error("Can only set attendance price after creating")
      }
      validateRegisterTime(data.registerStart, data.registerEnd)
      return await attendanceRepository.create(handle, data)
    },
    async delete(handle, attendanceId: AttendanceId) {
      const poolHasAttendees = await attendeeRepository.attendanceHasAttendees(handle, attendanceId)
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

      const newAttendance = await attendanceRepository.update(handle, attendanceId, data)

      if (newAttendance.attendancePrice) {
        const event = await eventService.getByAttendance(handle, attendanceId)
        if (event === null) {
          throw new EventNotFoundError(`(attendanceId): ${attendanceId}`)
        }

        const url = `${configuration.WEB_PUBLIC_ORIGIN}/arrangementer/${slugify(event.title)}/${event.id}`

        const metadata = {
          group: event.hostingGroups.map((group) => group.slug).join(", "),
        }

        const groupsText = ogJoin(event.hostingGroups.map((group) => group.name ?? group.slug))

        const description = event.hostingGroups ? `Arrangert av ${groupsText}` : undefined

        await paymentService.createOrUpdateProduct(
          attendanceId,
          event.title,
          newAttendance.attendancePrice,
          url,
          event.imageUrl,
          description,
          metadata
        )
        await taskSchedulingService.scheduleAt(
          handle,
          "CHARGE_ATTENDANCE_PAYMENTS",
          { attendanceId },
          new TZDate(newAttendance.deregisterDeadline)
        )
      }

      return newAttendance
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
        await attendeeRepository.moveFromMultiplePoolsToPool(handle, poolsToMergeIds, newMergePool.id)

        for (const pool of poolsToMerge) {
          await attendanceRepository.deletePool(handle, pool.id)
        }
      }

      await taskSchedulingService.scheduleAt(
        handle,
        tasks.MERGE_POOLS.type,
        {
          attendanceId,
          newMergePoolData,
        },
        new TZDate(mergeTime)
      )
    },
    async getSelectionsResponseSummary(handle, attendanceId) {
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      const attendees = await attendeeRepository.getByAttendanceId(handle, attendanceId)
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
      if (await attendeeRepository.poolHasAttendees(handle, attendancePoolId)) {
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
    async handleMergePoolsTask(handle, { attendanceId, newMergePoolData }) {
      return this.mergeAttendancePools(handle, attendanceId, newMergePoolData)
    },
    async handleAttemptReserveAttendeeTask(handle, { userId, attendanceId }) {
      const attendance = await this.getById(handle, attendanceId)
      const attendee = await attendeeService.getByUserId(handle, userId, attendanceId)
      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      if (!pool) {
        throw new AttendancePoolNotFoundError(attendee.attendancePoolId)
      }
      await attendeeService.attemptReserve(handle, attendee, pool, attendance, { bypassCriteria: false })
    },
    async handleChargePaymentTask(handle, { attendanceId }) {
      console.log(`Charging attendees of attendance with id ${attendanceId}`)
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      if (attendance.deregisterDeadline > getCurrentUTC()) {
        console.log(`Not charging ${attendanceId} because task is too early`)
        return
      }
      const attendees = await attendeeRepository.getByAttendanceId(handle, attendanceId)

      for (const attendee of attendees) {
        console.log(`Charging attendee ${attendee.id}`)
        await attendeeService.chargeAttendee(handle, attendee.id)
      }
    },
  }
}

function validateRegisterTime(registerStart: Date, registerEnd: Date) {
  if (!isAfter(registerEnd, registerStart) || differenceInMinutes(registerEnd, registerStart) < 1) {
    throw new AttendanceValidationError("Register end must be at least one minute after register start")
  }
}
