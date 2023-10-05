import { type Company, type Event } from "@dotkomonline/types";

import { type Cursor } from "../../utils/db-utils";
import { type EventCompanyRepository } from "./event-company-repository";

export interface EventCompanyService {
    createCompany(id: Event["id"], company: Company["id"]): Promise<void>;
    deleteCompany(id: Event["id"], company: Company["id"]): Promise<void>;
    getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor): Promise<Array<Company>>;
    getEventsByCompanyId(id: Company["id"], take: number, cursor?: Cursor): Promise<Array<Event>>;
}

export class EventCompanyServiceImpl implements EventCompanyService {
    public constructor(private readonly eventCompanyRepository: EventCompanyRepository) {}

    public async createCompany(id: Event["id"], company: Company["id"]) {
        try {
            const companies = await this.eventCompanyRepository.createCompany(id, company);

            return companies;
        } catch (err) {
            throw new Error("Failed to add company to event");
        }
    }

    public async deleteCompany(id: Event["id"], company: Company["id"]) {
        await this.eventCompanyRepository.deleteCompany(id, company);
    }

    public async getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
        return await this.eventCompanyRepository.getCompaniesByEventId(id, take, cursor);
    }

    public async getEventsByCompanyId(companyId: Company["id"], take: number, cursor?: Cursor): Promise<Array<Event>> {
        const events = await this.eventCompanyRepository.getEventsByCompanyId(companyId, take, cursor);

        return events;
    }
}
