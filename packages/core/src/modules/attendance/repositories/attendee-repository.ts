import { type Database } from "@dotkomonline/db";
import {
  AttendeeDBUserSchema,
  AttendeeSchema,
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeDBUser,
  type AttendeeId,
  type AttendeeWrite,
  type UserDB,
  type UserId,
} from "@dotkomonline/types";
import { sql, type Kysely } from "kysely";
import { prepareJsonInsert } from "../../../utils/db-utils";
import { type DeleteResult, type UpdateResult } from "../../utils";

const mapToAttendee = (obj: unknown): Attendee => AttendeeSchema.parse(obj);
const mapToAttendeeWithUser = (obj: unknown): AttendeeDBUser =>
  AttendeeDBUserSchema.parse(obj);

export interface _AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>;
  delete(id: AttendeeId): Promise<DeleteResult>;
  getByPoolId(poolId: AttendancePoolId): Promise<Attendee[]>;
  getById(id: AttendeeId): Promise<Attendee>;
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<UpdateResult>;
  updateExtraChoices(
    id: AttendeeId,
    questionId: string,
    choiceId: string
  ): Promise<UpdateResult>;
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendeeDBUser[]>;
  getByUserId(
    userId: UserId,
    attendanceId: AttendanceId
  ): Promise<Attendee | undefined>;
}

export class _AttendeeRepositoryImpl implements _AttendeeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin(
        "attendancePool",
        "attendancePool.id",
        "attendee.attendancePoolId"
      )
      .where("userId", "=", userId)
      .where("attendancePool.attendanceId", "=", attendanceId)
      .executeTakeFirst();

    if (!res) {
      return undefined;
    }

    return mapToAttendee(res);
  }

  async create(obj: AttendeeWrite): Promise<Attendee> {
    return mapToAttendee(
      await this.db
        .insertInto("attendee")
        .values(prepareJsonInsert(obj, "extrasChoices"))
        .returningAll()
        .executeTakeFirstOrThrow()
    );
  }

  async delete(id: AttendeeId): Promise<DeleteResult> {
    const res = await this.db
      .deleteFrom("attendee")
      .where("id", "=", id)
      .executeTakeFirst();
    return {
      numDeletedRows: Number(res.numDeletedRows),
    };
  }

  async getById(id: AttendeeId): Promise<Attendee> {
    return mapToAttendee(
      await this.db
        .selectFrom("attendee")
        .selectAll("attendee")
        .where("id", "=", id)
        .executeTakeFirstOrThrow()
    );
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("owUser", "owUser.id", "attendee.userId")
      .leftJoin(
        "attendancePool",
        "attendee.attendancePoolId",
        "attendancePool.id"
      )
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .select(
        sql<
          UserDB[]
        >`COALESCE(json_agg(ow_user) FILTER (WHERE ow_user.id IS NOT NULL), '[]')`.as(
          "user"
        )
      )
      .where("attendance.id", "=", attendanceId)
      .groupBy("attendee.id")
      .execute();

    return res
      .map((value) => ({
        ...value,
        user: {
          ...value.user[0],
          createdAt: new Date(value.user[0].createdAt),
        },
      }))
      .map(mapToAttendeeWithUser);
  }

  async getByPoolId(poolId: AttendancePoolId): Promise<Attendee[]> {
    return (
      await this.db
        .selectFrom("attendee")
        .selectAll("attendee")
        .where("attendancePoolId", "=", poolId)
        .execute()
    ).map(mapToAttendee);
  }

  async update(obj: AttendeeWrite, id: AttendeeId): Promise<UpdateResult> {
    const res = await this.db
      .updateTable("attendee")
      .set(prepareJsonInsert(obj, "extrasChoices"))
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    return {
      numUpdatedRows: Number(res.numUpdatedRows),
    };
  }

  async updateExtraChoices(
    id: AttendeeId,
    questionId: string,
    choiceId: string
  ): Promise<UpdateResult> {
    const res = await this.db
      .updateTable("attendee")
      .set({
        extrasChoices: JSON.stringify([{ id: questionId, choice: choiceId }]),
      })
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    return { numUpdatedRows: Number(res.numUpdatedRows) };
  }
}
