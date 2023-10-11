import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const products: Insertable<Database["product"]>[] = [
  {
    id: "01HB64TWZMXJEXKB3M7RQ705E5",
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
    id: "01HB64TWZM3GN9R4DEYK0Q6RZG",
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
