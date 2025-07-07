import type { DBHandle } from "@dotkomonline/db"
import type { AttendanceEvent, Company, CompanyId, EventId } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service.js"
import type { CompanyEventRepository } from "./company-event-repository"

export interface CompanyEventService {
  getAttendanceEventsByCompanyId(handle: DBHandle, companyId: CompanyId, page: Pageable): Promise<AttendanceEvent[]>
  getCompaniesByEventId(handle: DBHandle, eventId: EventId): Promise<Company[]>
}

export function getCompanyEventService(
  companyEventRepository: CompanyEventRepository,
  attendanceService: AttendanceService
): CompanyEventService {
  return {
    async getAttendanceEventsByCompanyId(handle, companyId, page) {
      const events = await companyEventRepository.getEventsByCompanyId(handle, companyId, page)
      const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as EventId[]
      const attendances = await attendanceService.getByIds(attendanceIds)
      const attendanceEvents: AttendanceEvent[] = events.map((event) => {
        const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null
        return { ...event, attendance }
      })

      return attendanceEvents
    },
    async getCompaniesByEventId(handle, eventId) {
      return await companyEventRepository.getCompaniesByEventId(handle, eventId)
    },
  }
}
