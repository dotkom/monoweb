import type { AttendanceEvent, Company, CompanyId, EventId } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service.js"
import type { CompanyEventRepository } from "./company-event-repository"

export interface CompanyEventService {
  getAttendanceEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<AttendanceEvent[]>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  private readonly companyEventRepository: CompanyEventRepository
  private readonly attendanceService: AttendanceService

  constructor(companyEventRepository: CompanyEventRepository, attendanceService: AttendanceService) {
    this.companyEventRepository = companyEventRepository
    this.attendanceService = attendanceService
  }

  public async getAttendanceEventsByCompanyId(companyId: CompanyId, page: Pageable) {
    const events = await this.companyEventRepository.getEventsByCompanyId(companyId, page)

    const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as EventId[]
    const attendances = await this.attendanceService.getByIds(attendanceIds)

    const attendanceEvents: AttendanceEvent[] = events.map((event) => {
      const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null

      return { ...event, attendance }
    })

    return attendanceEvents
  }

  public async getCompaniesByEventId(eventId: EventId) {
    return this.companyEventRepository.getCompaniesByEventId(eventId)
  }
}
