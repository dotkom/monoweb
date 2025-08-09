import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger";
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceSelection,type AttendanceSelectionResponse,
  type AttendanceWrite, type Attendee, type AttendeeId, type TaskId,
  type UserId, findActiveMembership, getMembershipGrade, 
} from "@dotkomonline/types"
import {getCurrentUTC} from "@dotkomonline/utils";
import {
  addHours, compareDesc,
  differenceInHours,
  differenceInMinutes,
  differenceInYears,
  isAfter,
  isBefore,
  isFuture, isPast
} from "date-fns"
import invariant from "tiny-invariant";
import type {PersonalMarkService} from "../mark/personal-mark-service";
import {
  type InferTaskData,
  type MergeAttendancePoolsTaskDef,
  type ReserveAttendeeTaskDef,
  tasks,
} from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { UserService } from "../user/user-service";
import { AttendanceDeletionError, AttendanceNotFound, AttendanceValidationError } from "./attendance-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"
import type { AttendeeService } from "./attendee-service"

type EventRegistrationOptions = {
  /** Should the user be attended regardless of if registration has not yet opened? */
  ignoreRegistrationWindow: boolean
  /** Should the user be immediately reserved? */
  immediateReservation: boolean
}

type EventDeregistrationOptions = {
  ignoreDeregistrationWindow: boolean
}

/**
 * Service for managing attendance, attendance pools, and the attendees that are attending an event.
 *
 * The following describes in broad terms the terminology used, and how the service generally works:
 */
export interface AttendanceService {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  getAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance>
  updateAttendanceById(handle: DBHandle, attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>
  /**
   * Create a new attendance pool for an event.
   *
   * There are a few rules that apply when creating a new pool:
   *
   * 1. There must not be any overlapping year criteria with any existing pools, as all pools are disjunctive sets with
   *    respect to the year criteria.
   * 2. We only support years 1 through 5. PhD students are counted as 5, and knights bypass the year criteria checks
   *    entirely.
   */
  createAttendancePool(handle: DBHandle, attendanceId: AttendanceId, data: AttendancePoolWrite): Promise<AttendancePool>
  deleteAttendancePool(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updateAttendancePool(
    handle: DBHandle,
    attendanceId: AttendanceId,
    attendancePoolId: AttendancePoolId,
    data: AttendancePoolWrite
  ): Promise<AttendancePool>
  /**
   * Register an attendee for an event.
   *
   * Due to how the year constraints are modelled (disjunctive set of all years across all pools), there is ONLY ONE
   * pool that a user may be eligible to register for at a time. This means that we do not need to provide which pool
   * to register for, as we can programatically determine this on our own.
   *
   * NOTE: This function does not necessarily register the attendee, it merely checks preconditions and schedules a task
   * to register the attendee which will be picked up by the task scheduling and executor services.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendance}.
   */
  registerAttendee(handle: DBHandle, attendanceId: AttendanceId, user: UserId, options: EventRegistrationOptions): Promise<Attendee | null>
  scheduleRegisterAttendeeTask(handle: DBHandle, attendanceId: AttendanceId, userId: UserId): Promise<TaskId | null>
  executeRegisterAttendeeTask(handle: DBHandle, task: InferTaskData<ReserveAttendeeTaskDef>): Promise<void>
  deregisterAttendee(handle: DBHandle, attendanceId: AttendanceId, attendeeId: AttendeeId, options: EventDeregistrationOptions): Promise<void>
  /**
   * Register that an attendee has physically attended an event.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendee}.
   */
  registerAttendance(handle: DBHandle, attendanceId: AttendanceId, attendee: AttendeeId): Promise<void>
  scheduleMergeEventPoolsTask(handle: DBHandle, attendanceId: AttendanceId, data: Pick<AttendancePoolWrite, 'title'>, mergeTime?: TZDate): Promise<void>
  executeMergeEventPoolsTask(
    handle: DBHandle,
    task: InferTaskData<MergeAttendancePoolsTaskDef>
  ): Promise<void>

  updateAttendanceSelections(handle: DBHandle, attendanceId: AttendanceId, selections: AttendanceSelection[]): Promise<void>
  updateAttendeeSelections(handle: DBHandle, attendeeId: AttendeeId, selections: AttendanceSelectionResponse[]): Promise<void>
}

export function getAttendanceService(
  attendanceRepository: AttendanceRepository,
  attendeeRepository: AttendeeRepository,
  attendeeService: AttendeeService,
  taskSchedulingService: TaskSchedulingService,
  userService: UserService,
  personalMarkService: PersonalMarkService,
): AttendanceService {
  const logger = getLogger("attendance-service")
  return {
    async createAttendance(handle, data) {
      validateAttendanceWrite(data)
      return await attendanceRepository.createAttendance(handle, data)
    },
    async findAttendanceById(handle, attendanceId) {
      return await attendanceRepository.findAttendanceById(handle, attendanceId)
    },
    async getAttendanceById(handle, attendanceId) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      return attendance
    },
    async updateAttendanceById(handle, attendanceId, data) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const input = {
        ...attendance,
        ...data,
      } satisfies AttendanceWrite
      validateAttendanceWrite(input)
      return await attendanceRepository.updateAttendanceById(handle, attendanceId, input)
    },
    async createAttendancePool(handle, attendanceId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceById(handle, attendanceId)
      validateAttendancePoolDisjunction(data.yearCriteria, attendance.pools)
      // If there are no years specified, we assume the pool is valid for all years not currently occupied by other
      // pools for the same attendance.
      if (data.yearCriteria.length === 0) {
        const remaining = [1, 2, 3, 4, 5]
        for (const pool of attendance.pools) {
          for (const year of pool.yearCriteria) {
            if (remaining.includes(year)) {
              remaining.splice(remaining.indexOf(year), 1)
            }
          }
        }
        if (remaining.length === 0) {
          throw new AttendanceDeletionError("Cannot create attendance pool as all years are occupied by other pools")
        }
        data.yearCriteria = remaining
      }
      return await attendanceRepository.createAttendancePool(handle, attendanceId, data)
    },
    async updateAttendancePool(handle, attendanceId, attendancePoolId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceById(handle, attendanceId)
      // Only pools except the current pool are relevant for the update.
      const relevantPools = attendance.pools.filter((pool) => pool.id !== attendancePoolId)
      if (relevantPools.length === attendance.pools.length) {
        throw new AttendanceNotFound(`AttendancePool(ID=${attendancePoolId}) was not found in Attendance(ID=${attendanceId})`)
      }
      validateAttendancePoolDisjunction(data.yearCriteria, relevantPools)
      return await attendanceRepository.updateAttendancePoolById(handle, attendancePoolId, data)
    },
    async registerAttendee(handle, attendanceId, userId, options) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const user = await userService.getById(handle, userId)
      if (attendance.attendees.some(a => a.userId === userId)) {
        throw new AttendanceValidationError(`User(ID=${userId}) is already registered for Attendance(ID=${attendanceId})`)
      }

      // Ensure the user has an active membership, and determine their effective grade
      const membership = findActiveMembership(user)
      if (membership === null) {
        throw new AttendanceValidationError(`User(ID=${userId}) cannot attend as they do not have an active membership`)
      }
      const grade = getMembershipGrade(membership)

      // Ensure the attempted registration is within the registration window.
      if (isBefore(getCurrentUTC(), attendance.registerStart) && !options.ignoreRegistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot register user(ID=${userId}) for Attendance(ID=${attendanceId}) before registration start`
        )
      }
      if (isAfter(getCurrentUTC(), attendance.registerEnd) && !options.ignoreRegistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot register user(ID=${userId}) for Attendance(ID=${attendanceId}) after registration end`
        )
      }

      // If the user is suspended at time of registration, we simply do not register them at all.
      const punishment = await personalMarkService.findPunishmentByUserId(handle, userId)
      if (punishment !== null && punishment.suspended) {
        return null
      }

      // Determining the pool to register the user for is done by finding the current year assumed for the user's active
      // membership.
      const applicablePool = attendance.pools.find(pool => {
        // Knights are not bound by any year criteria, and will thus occupy the first pool available.
        if (grade === null) {
          return true
        }
        const delta = differenceInYears(getCurrentUTC(), membership.start) + 1
        return pool.yearCriteria.includes(delta)
      })
      if (applicablePool === undefined) {
        logger.warn("User(ID=%s) attempted to register for Attendance(ID=%s) but no applicable pool was found", userId, attendanceId)
        return null
      }

      // Marking the attendee as registered is only half of the job, as we also schedule a task to reserve their place
      // in the pool
      let reservationTime = addHours(getCurrentUTC(), applicablePool.mergeDelayHours ?? 0)
      if (punishment !== null) {
        reservationTime = addHours(reservationTime, punishment.delay)
      }
      const attendee = await attendanceRepository.createAttendee(handle, attendanceId, applicablePool.id, userId, {
        attendedAt: null,
        earliestReservationAt: reservationTime,
        reserved: options.immediateReservation,
        selections: [],
        userGrade: grade,
      })
      // When a user is immediately reserved, there is no reason to schedule a task for them.
      if (!options.immediateReservation) {
        await taskSchedulingService.scheduleAt(handle, tasks.RESERVE_ATTENDEE, { attendeeId: attendee.id, attendanceId }, reservationTime)
      }
      return attendee
    },
    async executeRegisterAttendeeTask(handle, { attendanceId, attendeeId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const attendee = attendance.attendees.find(a => a.id === attendeeId)
      // NOTE: If the attendee does not exist, we have a non-critical bug in the app. The circumstances where this is
      // possible is when the attendee was removed from the attendance after the task was scheduled AND the task was not
      // cancelled.
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendanceId})`)
      }
      if (attendee.reserved) {
        return
      }

      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      invariant(pool !== undefined)
      const adjacentAttendees = attendance.attendees.filter(a => a.attendancePoolId === pool.id)
      const isPoolAtMaxCapacity = adjacentAttendees.length === pool.capacity
      const isPastReservationTime = isPast(attendee.earliestReservationAt)
      if (isPoolAtMaxCapacity || isPastReservationTime) {
        return;
      }
      await attendanceRepository.updateAttendeeById(handle, attendeeId, {
        ...attendee,
        reserved: true,
      })
    },
    async deregisterAttendee(handle, attendanceId, attendeeId, options) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      if (isPast(attendance.registerEnd) && !options.ignoreDeregistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot deregister Attendee(ID=${attendeeId}) from Attendance(ID=${attendanceId}) after registration end`
        )
      }

      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendanceId})`)
      }

      await attendanceRepository.deleteAttendeeById(handle, attendeeId)
      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      invariant(pool !== undefined)
      // We are now looking for a replacement for the attendee that just deregistered. The criteria that we need to
      // match are:
      //
      // 1. The attendee must be in the same pool as the deregistered attendee.
      // 2. The attendee must not yet be reserved
      // 3. The attendee must have a reservation time in the future
      const firstUnreservedAdjacentAttendee = attendance.attendees.filter(
        (a) => a.attendancePoolId === pool.id)
      .filter(a => !a.reserved)
        .filter(a => isPast(a.earliestReservationAt))
        .toSorted((a, b) => compareDesc(a.earliestReservationAt, b.earliestReservationAt))
        .at(0)
      if (firstUnreservedAdjacentAttendee === undefined) {
        return
      }

      await attendanceRepository.updateAttendeeById(handle, firstUnreservedAdjacentAttendee.id, {
        ...firstUnreservedAdjacentAttendee,
        reserved: true,
      })
    },
    async registerAttendance(handle, attendanceId, attendeeId) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendanceId})`)
      }

      // It is likely an error if the attendee is already marked as attended
      if (attendee.attendedAt !== null) {
        return
      }

      await attendanceRepository.updateAttendeeById(handle, attendeeId, {
        ...attendee,
        attendedAt: getCurrentUTC(),
      })
    },
    async scheduleMergeEventPoolsTask(handle, attendanceId, data, mergeTime = getCurrentUTC()) {

    },
    async executeMergeEventPoolsTask(handle, { attendanceId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const mergeablePools = attendance.pools.filter((pool) => {
        if (pool.mergeDelayHours === null) {
          return false
        }
        const mergeEligibleAt = addHours(attendance.registerStart, pool.mergeDelayHours)
        return isAfter(mergeTime, mergeEligibleAt)
      })
      // Depending on if there is zero or one pools, we either update the matching pool, or do nothing
      if (mergeablePools.length <= 1) {
        if (mergeablePools.length === 1) {
          const pool = mergeablePools.at(0)
          invariant(pool !== undefined)
          await attendanceRepository.updateAttendancePoolById(handle, pool.id, {
            ...pool,
            title: data.title,
          })
        }
        return
      }

      // We compute the next properties by summing up for all the pools.
      const defaultMergePool = {
        title: data.title,
        mergeDelayHours: null,
        capacity: 0,
        yearCriteria: [] as number[],
      } satisfies AttendancePoolWrite
      const input = mergeablePools.reduce((acc, curr) => {
        return {
          title: acc.title,
          mergeDelayHours: acc.mergeDelayHours,
          capacity: acc.capacity + curr.capacity,
          yearCriteria: acc.yearCriteria.concat(...curr.yearCriteria)
        }
      }, defaultMergePool)
      const pool = await attendanceRepository.createAttendancePool(handle, attendanceId, input)
      const mergeablePoolIds = mergeablePools.map((pool) => pool.id)
      await attendanceRepository.updateAttendeeAttendancePoolIdByAttendancePoolIds(handle, mergeablePoolIds, pool.id)
      await attendanceRepository.deleteAttendancePoolsByIds(handle, mergeablePoolIds)
    }
  }

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

    for (const attendee of toAttemptReserve) {
      const result = await attendeeService.attemptReserve(handle, attendee, newPool, { bypassCriteria: false })
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
    async createAttendance(handle, data: AttendanceWrite) {
      validateRegisterTime(data.registerStart, data.registerEnd)
      return await attendanceRepository.createAttendance(handle, data)
    },
    async findAttendanceById(handle, attendanceId) {

    }
    async getAttendanceById(handle, attendanceId) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      return attendance
    },
    async updateAttendanceById(handle, attendanceId, data) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
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

      return await attendanceRepository.updateAttendanceById(handle, attendanceId, data)
    },
    async mergeAttendancePools(handle, attendanceId, newMergePoolData, mergeTime = new Date()) {
      if (!mergeTime || !isFuture(mergeTime)) {
        const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
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
        const newMergePool = await attendanceRepository.addAttendancePool(handle, {
          attendanceId,
          title: newMergePoolData.title ?? "Merged pool",
          mergeDelayHours: null,
          yearCriteria,
          capacity,
        })

        const poolsToMergeIds = poolsToMerge.map((pool) => pool.id)
        await attendeeRepository.moveFromMultiplePoolsToPool(handle, poolsToMergeIds, newMergePool.id)

        for (const pool of poolsToMerge) {
          await attendanceRepository.removeAttendancePool(handle, pool.id)
        }
      }

      await taskSchedulingService.scheduleAt(
        handle,
        tasks.MERGE_ATTENDANCE_POOLS.type,
        {
          attendanceId,
          newMergePoolData,
        },
        new TZDate(mergeTime)
      )
    },
    async getSelectionsResponseSummary(handle, attendanceId) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
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
          count: selectionResponses.length,
          options: selection.options.map((option) => ({
            id: option.id,
            name: option.name,
            count: selectionResponses.filter((response) => response.optionId === option.id).length,
          })),
        }
      })
    },
    async createAttendancePool(handle, data: AttendancePoolWrite) {
      return await attendanceRepository.addAttendancePool(handle, data)
    },
    async deleteAttendancePool(handle, attendancePoolId) {
      if (await attendeeRepository.poolHasAttendees(handle, attendancePoolId)) {
        throw new AttendanceDeletionError("Cannot delete attendance pool with attendees")
      }
      return await attendanceRepository.removeAttendancePool(handle, attendancePoolId)
    },
    async updateAttendancePool(handle, attendancePoolId, data) {
      const currentPool = await attendanceRepository.getPoolById(handle, attendancePoolId)
      if (!currentPool) {
        throw new AttendancePoolNotFoundError(attendancePoolId)
      }

      const newPool = await attendanceRepository.updateAttendancePool(handle, attendancePoolId, data)
      if (data.capacity) {
        await attemptReserveAttendeesOnCapacityChange(handle, currentPool.capacity, newPool)
      }

      return newPool
    },
    async handleMergePoolsTask(handle, { attendanceId, newMergePoolData }) {
      return this.mergeAttendancePools(handle, attendanceId, newMergePoolData)
    },
    async handleAttemptReserveAttendeeTask(handle, { userId, attendanceId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const attendee = await attendeeService.getByUserId(handle, userId, attendanceId)
      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      if (!pool) {
        throw new AttendancePoolNotFoundError(attendee.attendancePoolId)
      }
      await attendeeService.attemptReserve(handle, attendee, pool, { bypassCriteria: false })
    },
  }
}

function validateRegisterTime(registerStart: Date, registerEnd: Date) {
  if (!isAfter(registerEnd, registerStart) || differenceInMinutes(registerEnd, registerStart) < 1) {
    throw new AttendanceValidationError("Register end must be at least one minute after register start")
  }
}

const areSelectionsEqual = (a: AttendanceSelection, b: AttendanceSelection) => {
  if (a.id !== b.id) return false
  if (a.name !== b.name) return false
  if (a.options.length !== b.options.length) return false

  return a.options.every((aOption) => {
    const bOption = b.options.find((bOption) => bOption.id === aOption.id)

    return bOption?.name === aOption.name
  })
}

function validateAttendanceWrite(data: AttendanceWrite) {
  if (isBefore(data.registerEnd, data.registerStart)) {
    throw new AttendanceValidationError("Cannot specify registration end before start")
  }
  if (differenceInHours(data.registerStart, data.registerEnd) < 1) {
    throw new AttendanceValidationError("Registration time must be at least one hour long")
  }
}

function validateAttendancePoolWrite(data: AttendancePoolWrite) {
  if (data.mergeDelayHours !== null && (data.mergeDelayHours < 0 || data.mergeDelayHours > 48)) {
    throw new AttendanceValidationError("Merge delay for pool must be between 0 and 48 hours")
  }
  if (data.capacity <= 0) {
    throw new AttendanceValidationError("Capacity for pool must be greater than 0")
  }
  if (data.yearCriteria.some(v => v < 1 || v > 5)) {
    throw new AttendanceValidationError("Year criteria must be between 1 and 5")
  }
}

/**
 * Ensure the planned year constraints do not cause an overlap with existing pools.
 */
function validateAttendancePoolDisjunction(plan: number[], pools: AttendancePool[]) {
  const currentYearConstraints = pools.reduce((acc, curr) => {
    // biome-ignore lint/performance/noAccumulatingSpread: this set has max 5 entries, and thus max 5 iterations
    return new Set([...acc, ...curr.yearCriteria])
  }, new Set<number>())

  const isOverlapping = plan.some(y => currentYearConstraints.has(y))
  if (isOverlapping) {
    throw new AttendanceValidationError("Planned years overlap with existing constrains defined in existing pools")
  }
}
