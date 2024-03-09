import { Kysely } from "kysely"
import { describe } from "vitest"
import { EventCompanyRepository, EventCompanyRepositoryImpl } from "../../event/event-company-repository"
import { EventCompanyService } from "../../event/event-company-service"
import { AttendanceRepository, AttendanceRepositoryImpl } from "../attendance-repository"
import { AttendeeRepository, AttendeeRepositoryImpl } from "../attendee-repository"
import { AttendancePoolRepository, AttendancePoolRepositoryImpl } from "../attendance-pool-repository"
import { Attendance, AttendancePool, Event, User } from "@dotkomonline/types"
import { ulid } from "ulid"
import { AttendeeService, AttendeeServiceImpl } from "../attendee-service"
import { UserRepository, UserRepositoryImpl } from "../../user/user-repository"
import { UserService, UserServiceImpl } from "../../user/user-service"

describe("Attendance before merge time", () => {
  // const db = vi.mocked(Kysely.prototype)

  // 1 create event
  // 2 create attendance for event
  // 3 create attendance pools for event
  // 4 sign up attendee for attendance
  // save snapshot of how attendance has changed
  // verify that attendance has changed as expected

  it("Can not attend if there is no matching group", async () => {})
})

describe("Attendance after merge time", () => {
  const db = vi.mocked(Kysely.prototype)
  const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl(db)
  const attendeeRepository: AttendeeRepository = new AttendeeRepositoryImpl(db)
  const attendancePoolRepository: AttendancePoolRepository = new AttendancePoolRepositoryImpl(db)
  const userRepository: UserRepository = new UserRepositoryImpl(db)

  const userService: UserService = new UserServiceImpl(userRepository)

  const attendeeService: AttendeeService = new AttendeeServiceImpl(
    attendeeRepository,
    attendancePoolRepository,
    attendanceRepository,
    userService
  )

  const attendance: Attendance = {
    id: ulid(),
    deregisterDeadline: new Date(),
    mergeTime: new Date(),
    registerEnd: new Date(),
    registerStart: new Date(),
  }

  const pool012: AttendancePool = {
    attendanceId: attendance.id,
    limit: 10,
    id: ulid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    numAttendees: 0,
    yearCriteria: [0, 1, 2],
  }

  const user1: User = {
    id: ulid(),
    name: "name",
    email: "email",
    auth0Sub: "auth0Sub",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
    studyYear: 1,
  }

  const event: Event = {
    attendanceId: attendance.id,
    createdAt: new Date(),
    description: "description",
    end: new Date(),
    id: ulid(),
    extras: [],
    imageUrl: "imageUrl",
    location: "location",
    public: true,
    start: new Date(),
    status: "ATTENDANCE",
    title: "",
    updatedAt: new Date(),
  }

  it("user can attend event when they have reserved spot and there is capacity", async () => {
    vi.spyOn(eventCompanyRepository, "createCompany").mockResolvedValueOnce(undefined)
    const event = await eventCompanyService.createCompany(id, bekk.id)
    expect(event).toEqual(undefined)
    expect(eventCompanyRepository.createCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("gets all companies related to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "getCompaniesByEventId").mockResolvedValueOnce([bekk])
    const companies = await eventCompanyService.getCompaniesByEventId(id, 20, undefined)
    expect(companies).toEqual([bekk])
    expect(eventCompanyRepository.getCompaniesByEventId).toHaveBeenCalledWith(id, 20, undefined)
  })

  it("deletes companies from an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    const companies = await eventCompanyService.deleteCompany(id, bekk.id)
    expect(companies).toEqual(undefined)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("silently deletes missing links", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    await eventCompanyService.deleteCompany(id, bekk.id)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
  })
})
