import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"

export const getProductFixtures: () => Insertable<Database["product"]>[] = () => [
  {
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
    type: "EVENT",
    objectId: "74171ce6-a83e-43c6-b3d0-ea1e569536f1",
    amount: 250,
    deletedAt: null,
    isRefundable: true,
    refundRequiresApproval: true,
  },
  {
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
    type: "EVENT",
    objectId: "b19acfa8-5363-4beb-b89f-c7c9637c099e",
    amount: 6969,
    deletedAt: null,
    isRefundable: false,
    refundRequiresApproval: false,
  },
]
