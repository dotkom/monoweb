import { type Generated } from "kysely";

export interface CommitteeTable {
  createdAt: Generated<Date>;
  description: string;
  email: null | string;
  id: Generated<string>;
  image: null | string;
  name: string;
  updatedAt: Generated<Date>;
}

export interface EventCommitteeTable {
  committeeId: string;
  eventId: string;
}
