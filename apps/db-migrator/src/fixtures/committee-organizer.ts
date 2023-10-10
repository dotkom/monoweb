import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const committeeOrganizers: Insertable<Database["committeeOrganizer"]>[] = [
  {
    eventId: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
    committeeId: "060bc7ee-d9ac-43bb-bc97-178deceb42cc",
  },
  {
    eventId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
    committeeId: "23361509-94d5-4123-81ca-fd2795223942",
  },
  {
    eventId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
    committeeId: "d19021fb-2f10-4b5c-92dd-098fe5cee4d7",
  },
]
