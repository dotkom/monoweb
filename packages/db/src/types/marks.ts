import { type Generated } from "kysely";

export interface MarkTable {
  category: string;
  createdAt: Generated<Date>;
  details: string;
  duration: number;
  id: Generated<string>;
  title: string;
  updatedAt: Generated<Date>;
}

export interface PersonalMarkTable {
  markId: string;
  userId: string;
}
