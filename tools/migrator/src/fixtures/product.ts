import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const getProductFixtures: () => Insertable<Database["product"]>[] = () => [
  {
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
    type: "EVENT",
    objectId: "01HB64TWZK1C5YK5J7VGNZPDGW",
    amount: 250,
    deletedAt: null,
    isRefundable: true,
    refundRequiresApproval: true,
  },
  {
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
    type: "EVENT",
    objectId: "01HB64TWZK1N8ABMH8JAE12101",
    amount: 6969,
    deletedAt: null,
    isRefundable: false,
    refundRequiresApproval: false,
  },
]
