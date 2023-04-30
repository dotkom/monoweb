import { UserServiceImpl } from "./auth/user-service"
import { CommitteeRepositoryImpl } from "./committee/committee-repository"
import { CommitteeServiceImpl } from "./committee/committee-service"
import { CompanyRepositoryImpl } from "./company/company-repository"
import { CompanyServiceImpl } from "./company/company-service"
import { AttendanceRepositoryImpl } from "./event/attendee-repository"
import { AttendServiceImpl } from "./event/attendee-service"
import { EventRepositoryImpl } from "./event/event-repository"
import { EventServiceImpl } from "./event/event-service"
import { kysely } from "@dotkomonline/db"
import { EventCompanyServiceImpl } from "./event/event-company-service"
import { EventCompanyRepositoryImpl } from "./event/event-company-repository"
import { clerkClient } from "@clerk/nextjs/server"
import { UserRepositoryImpl } from "./auth/user-repository"

export const initServices = () => {
  const db = kysely
  const eventRepository = new EventRepositoryImpl(db)
  const committeeRepository = new CommitteeRepositoryImpl(db)
  const companyRepository = new CompanyRepositoryImpl(db)
  const eventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const attendanceRepository = new AttendanceRepositoryImpl(db)
  const userRepository = new UserRepositoryImpl(db)

  // Services
  const userService = new UserServiceImpl(userRepository, clerkClient)
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository)
  const attendService = new AttendServiceImpl(attendanceRepository)
  const committeeService = new CommitteeServiceImpl(committeeRepository)
  const companyService = new CompanyServiceImpl(companyRepository)
  const eventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)
  const markService = initMarkService(MarkRepository)

  return {
    userService,
    eventService,
    committeeService,
    companyService,
    attendService,
    eventCompanyService,
    markService,
  }
}
