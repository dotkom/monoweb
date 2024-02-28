import { type WaitlistAttendee, type WaitlistAttendeeId, type WaitlistAttendeeWrite } from "@dotkomonline/types"
import { AttendanceRepository } from "../repositories"

export interface _WaitlistAttendeService {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
}

export class _WaitlistAttendeServiceImpl implements _WaitlistAttendeService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return this.attendanceRepository.waitlistAttendee.create(obj)
  }

  async delete(id: WaitlistAttendeeId): Promise<void> {
    await this.attendanceRepository.waitlistAttendee.delete(id)
  }
}
