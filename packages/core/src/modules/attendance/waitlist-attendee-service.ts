import { type WaitlistAttendee, type WaitlistAttendeeId, type WaitlistAttendeeWrite } from "@dotkomonline/types"
import { WaitlistAttendeRepository } from "./waitlist-attendee-repository"

export interface WaitlistAttendeService {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
}

export class WaitlistAttendeServiceImpl implements WaitlistAttendeService {
  constructor(private readonly waitlistAttendeeRepository: WaitlistAttendeRepository) {
    this.waitlistAttendeeRepository = waitlistAttendeeRepository
  }

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return this.waitlistAttendeeRepository.create(obj)
  }

  async delete(id: WaitlistAttendeeId): Promise<void> {
    await this.waitlistAttendeeRepository.delete(id)
  }
}
