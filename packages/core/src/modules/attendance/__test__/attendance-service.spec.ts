import { describe, vi } from "vitest"
import { JobServiceImpl } from "../../job/job-service"
import { AttendanceRepositoryImpl } from "../attendance-repository"
import { AttendanceServiceImpl } from "../attendance-service"
import { AttendeeRepositoryImpl } from "../attendee-repository"
import { AttendeeServiceImpl } from "../attendee-service"

describe("AttendanceService", () => {
  const attendanceRepository = vi.mocked(AttendanceRepositoryImpl.prototype)
  const attendeeRepository = vi.mocked(AttendeeRepositoryImpl.prototype)
  const attendeeService = vi.mocked(AttendeeServiceImpl.prototype)
  const jobService = vi.mocked(JobServiceImpl.prototype)

  const attendanceService = new AttendanceServiceImpl(
    attendanceRepository,
    attendeeRepository,
    attendeeService,
    jobService
  )
})
