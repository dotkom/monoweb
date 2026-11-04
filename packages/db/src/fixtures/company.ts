import type { Prisma } from "../"

export const fixtureCompanySlug = {
  bekk: "bekk",
  juniorConsulting: "junior-consulting",
} as const

export type FixtureCompanyKey = keyof typeof fixtureCompanySlug

export const fixtureCompanyId = {
  bekk: "c1000001-0000-4000-8000-000000000001",
  juniorConsulting: "c1000002-0000-4000-8000-000000000002",
} as const

export const companySlug = (key: FixtureCompanyKey): string => fixtureCompanySlug[key]

export const companyId = (key: FixtureCompanyKey): string => fixtureCompanyId[key]

export const getCompanyFixtures = () =>
  [
    {
      id: fixtureCompanyId.bekk,
      createdAt: new Date("2023-02-28 17:23:45.329666+00"),
      name: "Bekk",
      slug: companySlug("bekk"),
      description: "Litt mindre enn en elv",
      phone: "+47 123 45 678",
      email: "bekk@bekk.no",
      website: "https://bekk.no",
      location: "Oslo & Trondheim",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/6a826628-9ebf-426e-9966-625513779427.png",
    },
    {
      id: fixtureCompanyId.juniorConsulting,
      createdAt: new Date("2023-03-01 14:50:38.564678+00"),
      name: "Junior Consulting",
      slug: companySlug("juniorConsulting"),
      description: "Et konsulentselskap drevet av erfaringssultne studenter",
      phone: "+47 876 54 321",
      email: "test@jrc.no",
      website: "https://www.jrc.no/",
      location: "Trondheim",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/md/8b65f23a-94a4-4b24-a997-bb051b9c831a.png",
    },
  ] as const satisfies Prisma.CompanyCreateManyInput[]
