import { type Database } from "@dotkomonline/db";
import { type AttendeeTable } from "@dotkomonline/db/src/types/event";
import {
    type Attendance,
    AttendanceSchema,
    type AttendanceWrite,
    type Attendee,
    AttendeeSchema,
    type AttendeeWrite,
    type Event,
} from "@dotkomonline/types";
import { type Kysely, sql } from "kysely";

export interface AttendanceRepository {
    create(attendanceWrite: AttendanceWrite): Promise<Attendance>;
    createAttendee(attendeeWrite: AttendeeWrite): Promise<Attendee>;
    getByAttendanceId(id: Attendance["id"]): Promise<Attendance | undefined>;
    getByEventId(eventId: Event["id"]): Promise<Array<Attendance>>;
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(attendanceWrite: AttendanceWrite) {
        const res = await this.db
            .insertInto("attendance")
            .values({
                ...attendanceWrite,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return AttendanceSchema.parse(res);
    }

    public async createAttendee(attendeeWrite: AttendeeWrite) {
        const res = await this.db
            .insertInto("attendee")
            .values({
                attendanceId: attendeeWrite.attendanceId,
                userId: attendeeWrite.userId,
            })
            .returningAll()
            .executeTakeFirstOrThrow()
            .catch((err) => console.log(err));

        console.log({ res });

        return AttendeeSchema.parse(res);
    }

    public async getByAttendanceId(id: Attendance["id"]) {
        const res = await this.db
            .selectFrom("attendance")
            .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
            .selectAll("attendance")
            .select(
                sql<Array<AttendeeTable>>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as(
                    "attendees"
                )
            )
            .groupBy("attendance.id")
            .where("id", "=", id)
            .executeTakeFirst();

        return res ? AttendanceSchema.parse(res) : undefined;
    }

    public async getByEventId(eventId: string) {
        const res = await this.db
            .selectFrom("attendance")
            .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
            .selectAll("attendance")
            .select(
                sql<Array<AttendeeTable>>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as(
                    "attendees"
                )
            )
            .groupBy("attendance.id")
            .where("eventId", "=", eventId)
            .execute();

        return res.map((r) => AttendanceSchema.parse(r));
    }
}
