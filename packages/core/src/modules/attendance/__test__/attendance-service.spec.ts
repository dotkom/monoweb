import { describe, vi } from "vitest"
import { JobServiceImpl } from "../../job/job-service.js"
import { AttendanceRepositoryImpl } from "../attendance-repository"
import { AttendanceServiceImpl } from "../attendance-service"
import { AttendeeRepositoryImpl } from "../attendee-repository"

describe("AttendanceService", () => {
  const attendanceRepository = vi.mocked(AttendanceRepositoryImpl.prototype)
  const attendeeRepository = vi.mocked(AttendeeRepositoryImpl.prototype)
  const jobService = vi.mocked(JobServiceImpl.prototype)

  const attendanceService = new AttendanceServiceImpl(attendanceRepository, attendeeRepository, jobService)
})
