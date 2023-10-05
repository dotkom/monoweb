import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const eventCompany: Array<Insertable<Database["eventCompany"]>> = [
    {
        eventId: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
        companyId: "7c45f557-0ae2-4153-9934-375dc8c94f7b",
    },
    {
        eventId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
        companyId: "7c45f557-0ae2-4153-9934-375dc8c94f7b",
    },
    {
        eventId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
        companyId: "200fa69b-1037-471e-ad6e-7047444c7e35",
    },
];
