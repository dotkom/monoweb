import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const offlines: Insertable<Database["offline"]>[] = [
  {
    title: "Offline #1",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/1-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%231-Image.png",
  },
  {
    title: "Offline #2",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/2-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%232-Image.png",
  },
  {
    title: "Offline #3",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/3-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%233-Image.png",
  },
  {
    title: "Offline #4",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/4-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%234-Image.png",
  },
  {
    title: "Offline #5",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/5-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%235-Image.png",
  },
  {
    title: "Offline #6",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/6-offline",
    imageUrl: "https://s3.eu-north-1.amazonaws.com/dev.cdn.online.ntnu.no/offlines/Offline-%236-Image.png",
  },
]
