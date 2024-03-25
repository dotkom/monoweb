import { CompanyId, EventFeedback, EventFeedbackId, EventFeedbackWrite, EventId } from "@dotkomonline/types"
import { type Kysely, type Selectable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type Pageable, paginatedQuery, Collection } from "../../utils/db-utils"

export interface EventFeedbackRepository {
  getByEvent(eventId: EventId): Promise<Collection<EventFeedback>>
  getByCompany(companyId: CompanyId): Promise<Collection<EventFeedback>>
  getAll(pageable: Pageable): Promise<Collection<EventFeedback>>
  create(values: EventFeedbackWrite): Promise<EventFeedback>
  getById(id: EventFeedbackId): Promise<EventFeedback>
  update(id: EventFeedbackId, values: Partial<EventFeedbackWrite>): Promise<EventFeedback>
  delete(id: EventFeedbackId): Promise<void>
}

export class EventFeedbackRepositoryImpl implements EventFeedbackRepository {
  constructor(private readonly db: Kysely<Database>) {}

    async getByEvent(eventId: EventId): Promise<Collection<EventFeedback>> {
        
    }
}