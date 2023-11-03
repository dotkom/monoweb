import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const eventCommittees: Insertable<Database["eventCommittee"]>[] = [
  {
    eventId: "01HB64TWZK1C5YK5J7VGNZPDGW",
    committeeId: "01HB64JAPVE9RXE19JX2BXSNJX",
  },
  {
    eventId: "01HB64TWZK1N8ABMH8JAE12101",
    committeeId: "01HB64JAPVVHCWQAWQGFATVZXZ",
  },
  {
    eventId: "01HB64TWZK1N8ABMH8JAE12101",
    committeeId: "01HB64JAPW4FP1BJV0NTQSBF19",
  },
]
