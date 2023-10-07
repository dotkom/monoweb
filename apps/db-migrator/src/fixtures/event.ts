import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const events: Array<Insertable<Database["event"]>> = [
  {
    committeeId: null,
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    description: "Dette er et kurs i å lage fixtures",
    end: new Date("2023-02-22 01:33:00+00"),
    id: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Hovedbygget",
    public: true,
    start: new Date("2023-02-17 00:00:00+00"),
    status: "PUBLIC",
    subtitle: "Kurs i fixtures",
    title: "Kurs i å lage fixtures",
    type: "SOCIAL",
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    waitlist: null,
  },
  {
    committeeId: "d19021fb-2f10-4b5c-92dd-098fe5cee4d7",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    description: "Tur til åre",
    end: new Date("2023-02-23 11:03:38.63+00"),
    id: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Åre, Sverige",
    public: false,
    start: new Date("2023-02-23 11:40:00+00"),
    status: "NO_LIMIT",
    subtitle: "Subtitle tur til åre",
    title: "Åre 2024",
    type: "SOCIAL",
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    waitlist: null,
  },
];
