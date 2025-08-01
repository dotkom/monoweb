import type { Prisma } from "@prisma/client"

export const getCompanyFixtures = () =>
  [
    {
      createdAt: new Date("2023-02-28 17:23:45.329666+00"),
      name: "Bekk",
      slug: "bekk",
      description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
      phone: "+47 123 45 678",
      email: "bekk@bekk.no",
      website: "https://bekk.no",
      location: "Oslo & Trondheim",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/6a826628-9ebf-426e-9966-625513779427.png",
    },
    {
      createdAt: new Date("2023-03-01 14:50:38.564678+00"),
      name: "Junior Consulting",
      slug: "junior-consulting",
      description: "Et konsulentselskap drevet av erfaringssultne studenter",
      phone: "+47 876 54 321",
      email: "test@jrc.no",
      website: "https://www.jrc.no/",
      location: "Trondheim",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/8b65f23a-94a4-4b24-a997-bb051b9c831a.png",
    },
  ] as const satisfies Prisma.CompanyCreateManyInput[]
