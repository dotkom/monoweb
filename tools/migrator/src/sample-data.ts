import { getEventAndAttendanceSampleData } from "./ow4-sample-data/ow4-events"
import { db } from "./db"

export async function runSampleData() {
  const { events, attendances: possibleAttendances } = await getEventAndAttendanceSampleData()

  const eventIds = (
    await db
      .insertInto("event")
      .onConflict((eb) => eb.doNothing())
      .values(events)
      .returning("event.id")
      .execute()
  ).map((row) => row.id)

  const attendances = []
  for (let i = 0; i < eventIds.length; i++) {
    const attendance = possibleAttendances[i]
    if (attendance === null) {
      continue
    }
    attendance.eventId = eventIds[i]
    attendances.push(attendance)
  }

  const attendanceIds = (
    await db
      .insertInto("attendance")
      .onConflict((eb) => eb.doNothing())
      .values(attendances)
      .returning("attendance.id")
      .execute()
  ).map((a) => a.id)
}
