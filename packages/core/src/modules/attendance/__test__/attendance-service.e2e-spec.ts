import { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import { AttendancePoolWrite, AttendanceWrite, AttendeeWrite, EventWrite, UserWrite } from "@dotkomonline/types"
import crypto from "crypto"
import { Kysely } from "kysely"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getTestDb, setupTestDB } from "../../../../vitest-integration.setup"
import { createServiceLayer, type ServiceLayer } from "../../core"

const fakeUser = (write: Partial<UserWrite>): UserWrite => ({
  auth0Sub: write.auth0Sub ?? crypto.randomUUID(),
  studyYear: write.studyYear ?? 1,
  email: write.email ?? "testuser@local.com",
  name: write.name ?? "Test User",
  lastSyncedAt: write.lastSyncedAt ?? new Date(),
})

const fakeAttendance = (write: Partial<AttendanceWrite>): AttendanceWrite => ({
  deregisterDeadline: write.deregisterDeadline ?? new Date(),
  mergeTime: write.mergeTime ?? new Date(),
  registerEnd: write.registerEnd ?? new Date(),
  registerStart: write.registerStart ?? new Date(),
})

// const fakePool012: AttendancePool = {
const fakePool = (write: Partial<AttendancePoolWrite>): AttendancePoolWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  limit: write.limit ?? 10,
  yearCriteria: write.yearCriteria ?? [0, 1, 2],
})

const fakeAttendee = (write: Partial<AttendeeWrite>): AttendeeWrite => ({
  userId: write.userId ?? ulid(),
  attendancePoolId: write.attendancePoolId ?? ulid(),
  attended: write.attended ?? false,
  extrasChoices: write.extrasChoices ?? [],
})

const fakeEvent = (write: Partial<EventWrite>): EventWrite => ({
  attendanceId: write.attendanceId ?? ulid(),
  description: write.description ?? "description",
  end: write.end ?? new Date(),
  extras: write.extras ?? [],
  imageUrl: write.imageUrl ?? "imageUrl",
  location: write.location ?? "location",
  public: write.public ?? true,
  start: write.start ?? new Date(),
  status: write.status ?? "ATTENDANCE",
  title: write.title ?? "",
  subtitle: write.subtitle ?? "",
  type: write.type ?? "ACADEMIC",
})

describe("attendance", () => {
  let core: ServiceLayer
  let db: Kysely<Database>
  const dbName = "attendance"

  beforeEach(async () => {
    const env = createEnvironment()
    await setupTestDB(env, dbName)

    db = getTestDb(env, dbName)

    core = await createServiceLayer({ db })
  })

  afterEach(async () => {
    await db.destroy()
  })

  afterEach(async () => {
    await db.destroy()
  })

  it("repository crud", async () => {
    const attendance = await core.attendanceService.create({})

    const found = await core.attendanceService.getById(attendance.id)

    expect(found).not.toBeNull()
  })
})
