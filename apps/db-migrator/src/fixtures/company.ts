import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const companies: Array<Insertable<Database["company"]>> = [
  {
    createdAt: new Date("2023-02-28 17:23:45.329666+00"),
    description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
    email: "bekk@bekk.no",
    id: "7c45f557-0ae2-4153-9934-375dc8c94f7b",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/6a826628-9ebf-426e-9966-625513779427.png",
    location: "Oslo & Trondheim",
    name: "Bekk",
    phone: "+47 123 45 678",
    type: "Consulting",
    website: "https://bekk.no",
  },
  {
    createdAt: new Date("2023-03-01 14:50:38.564678+00"),
    description: "Et konsulentselskap drevet av erfaringssultne studenter",
    email: "test@jrc.no",
    id: "200fa69b-1037-471e-ad6e-7047444c7e35",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/8b65f23a-94a4-4b24-a997-bb051b9c831a.png",
    location: "Trondheim",
    name: "Junior Consulting",
    phone: "+47 876 54 321",
    type: "Consulting",
    website: "https://www.jrc.no/",
  },
];
