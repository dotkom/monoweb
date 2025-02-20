import type {
  Attendance,
  AttendanceId,
  AttendancePool,
  AttendanceWrite,
  AttendanceQuestionResponse,
  AttendanceQuestion,
  UserId,
  WaitlistAttendee,
  AttendanceQuestionResults as AttendanceQuestionResult,
  AttendancePoolWrite,
  AttendancePoolId,
} from "@dotkomonline/types"
import { UserNotFoundError } from "../user/user-error"
import type { UserService } from "../user/user-service"
import {
  AttendanceDeletionError,
  AttendanceNotFound,
  AttendanceValidationError,
  QuestionResponseUpdateAfterRegistrationStartError,
  InvalidParametersError,
} from "./attendance-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"
import type { WaitlistAttendeRepository } from "./waitlist-attendee-repository"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(id: AttendanceId, obj: Partial<AttendanceWrite>): Promise<Attendance | null>
  merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]): Promise<void>
  updateQuestions(id: AttendanceId, questions: AttendanceQuestion[], now?: Date): Promise<Attendance | null>
  getQuestionResults(attendanceId: AttendanceId): Promise<AttendanceQuestionResult[] | null>
  getAttendablePoolByUserId(attendanceId: AttendanceId, userId: UserId): Promise<AttendancePool | null>

  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(poolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly waitlistAttendeeRepository: WaitlistAttendeRepository,
    private readonly userService: UserService
  ) {}

  async getQuestionResults(attendanceId: AttendanceId) {
    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const allQuestionResponses = attendees.flatMap(attendee => attendee.questionResponses);

    return attendance.questions.map(question => {
      const questionResponses = allQuestionResponses.filter(response => response.questionId === question.id);

      return {
        id: question.id,
        name: question.name,
        totalCount: questionResponses.length,
        choices: question.choices.map(choice => ({
          id: choice.id,
          name: choice.name,
          count: questionResponses.filter(response => response.choiceId === choice.id).length
        }))
      }
    });
  }

  async update(id: AttendanceId, obj: Partial<AttendanceWrite>) {
    const attendance = await this.attendanceRepository.update(obj, id)
    return attendance
  }

  async updateQuestions(id: AttendanceId, questions: AttendanceQuestion[], now: Date = new Date()) {
    const attendance = await this.attendanceRepository.getById(id)

    if (!attendance) {
      throw new AttendanceNotFound(id)
    }

    if (attendance.registerStart < now) {
      throw new QuestionResponseUpdateAfterRegistrationStartError()
    }

    return this.attendanceRepository.update(
      {
        ...attendance,
        questions,
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
      throw new AttendanceDeletionError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  async getAllWaitlistAttendeesOrdered(attendanceId: AttendanceId): Promise<WaitlistAttendee[]> {
    const waitlistAttendeesUnordered = await this.waitlistAttendeeRepository.getByAttendanceId(attendanceId)
    return waitlistAttendeesUnordered.sort(
      (a, b) => (a.registeredAt ?? new Date()).getTime() - (b.registeredAt ?? new Date()).getTime()
    )
  }

  async merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]) {
    const attendance = await this.attendanceRepository.getById(attendanceId)
    if (attendance === null) {
      throw new AttendanceNotFound(attendanceId)
    }

    // Check that the year criteria of the merge pool contains all of the year criteria of the pools being merged
    const combinedCriteria = Array.from(new Set(attendance.pools.flatMap((pool) => pool.yearCriteria)))
    if (!combinedCriteria.every((criteria) => yearCriteria.includes(criteria))) {
      throw new InvalidParametersError(
        `Merge pool must contain the combined year criteria of the pools being merged: (${combinedCriteria.join(",")})`
      )
    }

    const combinedCapacity = attendance.pools.reduce((acc, pool) => acc + pool.capacity, 0)
    const mergePool = await this.attendanceRepository.createPool({
      attendanceId,
      capacity: combinedCapacity,
      yearCriteria: yearCriteria,
      title: mergePoolTitle,
      isVisible: true,
      type: "MERGE",
    })

    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const waitlistAttendees = await this.getAllWaitlistAttendeesOrdered(attendanceId)

    await Promise.all(
      attendees.map((attendee) => this.attendeeRepository.update(attendee.id, { attendancePoolId: mergePool.id }))
    )
    await Promise.all(
      waitlistAttendees.map((waitlistAttendee, i) =>
        this.waitlistAttendeeRepository.update(waitlistAttendee.id, { attendancePoolId: mergePool.id, position: i })
      )
    )
    await Promise.all(attendance.pools.map((pool) => this.attendanceRepository.delete(pool.id)))
  }

  async getAttendablePoolByUserId(attendanceId: AttendanceId, userId: UserId) {
    const user = await this.userService.getById(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendance) {
      throw new AttendancePoolNotFoundError(attendanceId)
    }

    const userAttendee = await this.attendeeRepository.getByUserId(userId, attendanceId)

    if (userAttendee) {
      return null
    }

    return attendance.pools.find((pool) => pool.yearCriteria.includes(-69)) ?? null
  }

  async createPool(data: AttendancePoolWrite) {
    return await this.attendanceRepository.createPool(data)
  }

  async deletePool(poolId: AttendancePoolId) {
    return await this.attendanceRepository.deletePool(poolId)
  }

  async updatePool(poolId: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    return await this.attendanceRepository.updatePool(poolId, data)
  }
}
