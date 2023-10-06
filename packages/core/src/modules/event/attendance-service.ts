import { type Attendee, type Event, type User } from "@dotkomonline/types";

import { type AttendanceRepository } from "./attendance-repository";

export interface AttendanceService {
  canAttend(eventId: Event["id"]): Promise<Date | undefined>;
  deregisterForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>;
  registerForAttendance(eventId: Event["id"], userId: User["id"], attended: boolean): Promise<void>;
  registerForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>;
}

export class AttendanceServiceImpl implements AttendanceService {
  public constructor(private readonly attendanceRepository: AttendanceRepository) {}

  public async canAttend(_eventId: string) {
    return new Date();
  }

  public async deregisterForEvent(_eventId: string, _userId: string) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async registerForAttendance(_eventId: string, _userId: string, _attended: boolean) {}

  public async registerForEvent(userId: string, eventId: string) {
    const pools = await this.attendanceRepository.getByEventId(eventId);
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const attendee = await this.attendanceRepository.createAttendee({ attendanceId: pool.id, userId });

    return attendee;
  }
}
