import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const getPersonalMarkFixtures: (markIds: string[], userIds: string[]) => Insertable<Database["personalMark"]>[] =
  (markIds, userIds) => [
    {
      markId: markIds[0],
      userId: userIds[0],
    },
  ]
