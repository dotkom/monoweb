import type { DBClient } from "@dotkomonline/db"
import type {
  AttendanceId,
  AttendancePoolId,
  UserId,
  WaitlistAttendee,
  WaitlistAttendeeId,
  WaitlistAttendeeWrite,
} from "@dotkomonline/types"

export interface WaitlistAttendeRepository {
  create(data: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  update(id: WaitlistAttendeeId, obj: Partial<WaitlistAttendeeWrite>): Promise<WaitlistAttendee | null>
  delete(id: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  getByAttendanceId(id: AttendanceId): Promise<WaitlistAttendee[]>
  getByUserId(userId: UserId): Promise<WaitlistAttendee[] | null>
  getByPoolId(poolId: string): Promise<WaitlistAttendee[]>
}

export class WaitlistAttendeRepositoryImpl implements WaitlistAttendeRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async create(data: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return await this.db.waitlistAttendee.create({ data })
  }

  async update(id: WaitlistAttendeeId, data: Partial<WaitlistAttendeeWrite>) {
    return await this.db.waitlistAttendee.update({ where: { id }, data })
  }

  async delete(id: WaitlistAttendeeId) {
    return await this.db.waitlistAttendee.delete({ where: { id } })
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    return await this.db.waitlistAttendee.findMany({ where: { attendanceId } })
  }

  async getByUserId(userId: UserId) {
    return await this.db.waitlistAttendee.findMany({ where: { userId } })
  }

  async getByPoolId(attendancePoolId: AttendancePoolId) {
    return await this.db.waitlistAttendee.findMany({ where: { attendancePoolId } })
  }
}
