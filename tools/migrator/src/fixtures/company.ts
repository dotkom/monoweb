import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"

// export const companies: Insertable<Database["company"]>[] = [
export const getCompanyFixtures: () => Insertable<Database["company"]>[] = () => [
  {
    createdAt: new Date("2023-02-28 17:23:45.329666+00"),
    name: "Bekk",
    description:
      "Bekk er et konsulentselskap. Og et felleskap. Et fagmiljø, et kunnskapsverksted, en samarbeidspartner, en pådriver, et sted å vokse. Omtrent 600 nysgjerrigperer, rådgivere og digitale håndverkere som utvikler selskaper og bygger digitale tjenester som hjelper mennesker i hver by og bygd, hver eneste dag.\n\nVi har to brede tjenesteområder, som utfyller hverandre. Det ene er teknologi, design og produktledelse. Her finner du håndverkerne, de som bygger digitale produkter og tjenester som vi alle trenger i hverdagen.\n\nDet andre området er management consulting. Her finner du rådgiverne og forretningsutviklerne som hjelper selskaper med strategisk rådgivning, posisjonering, organisasjonsutvikling og omstilling for å møte økende krav til fleksibilitet og markedsendringer.",
    phone: "+47 123 45 678",
    email: "bekk@bekk.no",
    website: "https://bekk.no",
    location: "Oslo & Trondheim",
    type: "Consulting",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/6a826628-9ebf-426e-9966-625513779427.png",
  },
  {
    createdAt: new Date("2023-03-01 14:50:38.564678+00"),
    name: "Junior Consulting",
    description: "Et konsulentselskap drevet av erfaringssultne studenter",
    phone: "+47 876 54 321",
    email: "test@jrc.no",
    website: "https://www.jrc.no/",
    location: "Trondheim",
    type: "Consulting",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/8b65f23a-94a4-4b24-a997-bb051b9c831a.png",
  },
]
