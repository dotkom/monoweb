import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const products: Array<Insertable<Database["product"]>> = [
  {
    amount: 250,
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    deletedAt: null,
    id: "e7babbf1-cdbd-4aa1-942e-ca7c286783c2",
    isRefundable: true,
    objectId: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
    refundRequiresApproval: true,
    type: "EVENT",
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
  },
  {
    amount: 6969,
    createdAt: new Date("2023-04-29 21:20:15.229179+00"),
    deletedAt: null,
    id: "564c269a-a6bd-4fc9-b278-e8543d679421",
    isRefundable: false,
    objectId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
    refundRequiresApproval: false,
    type: "EVENT",
    updatedAt: new Date("2023-04-29 21:20:15.229179+00"),
  },
];
