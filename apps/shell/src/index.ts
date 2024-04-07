import { createServiceLayer } from "@dotkomonline/core"
import { Kysely, sql } from "kysely"
import { kysely } from "@dotkomonline/db"


createServiceLayer({ db: kysely }).then(async (core) => {
  const id = "01HTW9X18JA8A0CX8KN7ERJS1Z"
  const res = await kysely
  .selectFrom("attendee")
  .selectAll("attendee")
  .leftJoin("owUser", "owUser.id", "attendee.userId")
  .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
  .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
  .select(sql`COALESCE(json_agg(ow_user) FILTER (WHERE ow_user.id IS NOT NULL), '[]')`.as("user"))
  .where("attendance.id", "=", id)
  .groupBy("attendee.id")
  .execute()

  // find all attendance pools connected to attendance
  // const res = await kysely
    // .selectFrom("attendancePool")
    // .selectAll("attendancePool")
    // .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
    // .where("attendance.id", "=", id)
    // .execute()

  console.log("hello")
  console.log(res)
  const a = await core.attendeeService.getByAttendanceId(id)

  // console.log(a)

// console.log(res)
})

// const idp = new CognitoIDPRepositoryImpl()
