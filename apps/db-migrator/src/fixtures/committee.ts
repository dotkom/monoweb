import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const committees: Insertable<Database["committee"]>[] = [
  {
    id: "060bc7ee-d9ac-43bb-bc97-178deceb42cc",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    name: "Dotkom",
  },
  {
    id: "23361509-94d5-4123-81ca-fd2795223942",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    name: "Bedkom",
  },
  {
    id: "d19021fb-2f10-4b5c-92dd-098fe5cee4d7",
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    name: "Arrkom",
  },
  {
    id: "97913415-399b-4ddc-9a1e-deedc886c1b4",
    createdAt: new Date("2023-02-15 11:03:49.289+00"),
    name: "Hovedstyret",
  },
]
