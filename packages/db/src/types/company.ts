import { type Generated } from "kysely";

export interface CompanyTable {
    createdAt: Generated<Date>;
    description: string;
    email: string;
    id: Generated<string>;
    image: null | string;
    location: null | string;
    name: string;
    phone: null | string;
    type: null | string;
    website: string;
}

export interface EventCompanyTable {
    companyId: string;
    eventId: string;
}
