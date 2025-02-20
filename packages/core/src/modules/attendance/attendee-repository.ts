import type { DBClient } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type AttendanceQuestionResponse,
  type Attendee,
  type AttendeeId,
  AttendeeQuestionResponsesSchema,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { AttendeeWriteError } from "./attendee-error"

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee | null>
  getById(id: AttendeeId): Promise<Attendee | null>
  update(id: AttendeeId, obj: Partial<AttendeeWrite>): Promise<Attendee | null>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  constructor(private readonly db: DBClient) {}

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.db.attendee.findFirst({ where: { userId, attendanceId } })

    if (user === null) return null

    return this.parseQuestionResponses(user)
  }

  async create(data: AttendeeWrite): Promise<Attendee> {
    this.validateWrite(data)

    const createdUser = await this.db.attendee.create({ data })

    return this.parseQuestionResponses(createdUser)
  }

  async delete(id: AttendeeId) {
    const deletedUser = await this.db.attendee.delete({ where: { id } })

    return this.parseQuestionResponses(deletedUser)
  }

  async getById(id: AttendeeId): Promise<Attendee | null> {
    const user = await this.db.attendee.findUnique({ where: { id } })

    if (user === null) return null

    return this.parseQuestionResponses(user)
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const attendees = await this.db.attendee.findMany({ where: { attendanceId } })

    return attendees.map(this.parseQuestionResponses)
  }

  async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({ where: { attendancePoolId } })

    return attendees.map(this.parseQuestionResponses)
  }

  async update(id: AttendeeId, data: Partial<AttendeeWrite>) {
    this.validateWrite(data)

    const updatedUserResult = await this.db.attendee.updateManyAndReturn({ where: { id }, data })

    if (updatedUserResult.length === 0) return null

    return this.parseQuestionResponses(updatedUserResult[0])
  }

  private validateWrite(data: Partial<AttendeeWrite>) {
    if (data.questionResponses) {
      const questionResponseParseResult = AttendeeQuestionResponsesSchema.safeParse(data.questionResponses)

      if (!questionResponseParseResult.success) {
        throw new AttendeeWriteError("Invalid JSON data in AttendeeWrite field questionResponses")
      }
    }
  }

  private parseQuestionResponses<T extends { questionResponses: JsonValue }>({
    questionResponses,
    ...obj
  }: T): Omit<T, "questionResponses"> & { questionResponses: AttendanceQuestionResponse[] } {
    return { ...obj, questionResponses: AttendeeQuestionResponsesSchema.parse(questionResponses) }
  }
}
