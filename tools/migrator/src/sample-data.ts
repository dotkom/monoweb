import type { DB } from "@dotkomonline/db/src/db.generated"
import type { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser"
import { db } from "./db"
import { eventTypeMapping, getOW4Events } from "./ow4-sample-data/ow4-events"

export async function runSampleData() {
  const ow4Events = await getOW4Events()

  const attendances: InsertObjectOrList<DB, "attendance"> = ow4Events.map((event) => ({
    registerStart: new Date(event.event_start),
    registerEnd: new Date(event.event_end),
    deregisterDeadline: new Date(event.event_end),
  }))

  const attendanceIds = await db
    .insertInto("attendance")
    .onConflict((eb) => eb.doNothing())
    .values(attendances)
    .returning("attendance.id")
    .execute()
    .then((result) => result.map((row) => row.id))

  const attendancePools: InsertObjectOrList<DB, "attendancePool"> = attendances.map((attendance, index) => ({
    capacity: 10,
    attendanceId: attendanceIds[index],
    yearCriteria: JSON.stringify([0, 1, 2]),
    title: "Påmeldingsgruppe",
    isVisible: true,
    type: "NORMAL",
  }))

  await db
    .insertInto("attendancePool")
    .onConflict((eb) => eb.doNothing())
    .values(attendancePools)
    .execute()

  const events: InsertObjectOrList<DB, "event"> = ow4Events.map((event, index) => ({
    title: event.title,
    status: "PUBLIC",
    type: eventTypeMapping.get(event.event_type) ?? "SOCIAL",
    public: true,
    start: new Date(event.event_start),
    end: new Date(event.event_end),
    description: event.description,
    imageUrl: event.image?.lg ?? null,
    locationTitle: event.location,
    attendanceId: attendanceIds[index],
    subtitle: null,
    locationAddress: null,
    locationLink: null,
  }))

  await db
    .insertInto("event")
    .onConflict((eb) => eb.doNothing())
    .values(events)
    .execute()
}
