import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const events: Insertable<Database["event"]>[] = [
  {
    id: "01HB64TWZK1C5YK5J7VGNZPDGW",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    title: "Kurs i å lage fixtures",
    start: new Date("2023-02-17 00:00:00+00"),
    end: new Date("2023-02-22 01:33:00+00"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Dette er et kurs i å lage fixtures",
    subtitle: "Kurs i fixtures",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Hovedbygget",
    waitlist: null,
  },
  {
    id: "01HB64TWZK1N8ABMH8JAE12101",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    title: "Åre 2024",
    start: new Date("2023-02-23 11:40:00+00"),
    end: new Date("2023-02-23 11:03:38.63+00"),
    status: "NO_LIMIT",
    type: "SOCIAL",
    public: false,
    description: "Tur til åre",
    subtitle: "Subtitle tur til åre",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Åre, Sverige",
    waitlist: null,
  },
]
