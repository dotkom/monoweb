import { Seeder } from "."
import { Company, prisma } from ".."

export const seedCompanies: Seeder = async (chance, prisma) => {
  const companyInserts = [...new Array(10)].map(() => ({
    name: chance.company(),
    description: chance.paragraph({ sentences: 2 }),
    email: chance.email(),
    location: chance.country(),
    phone: chance.phone(),
    website: chance.url(),
  }))

  const promises = companyInserts.map((payload) =>
    prisma.company.upsert({
      where: { email: payload.email },
      update: payload,
      create: payload,
    })
  )

  await Promise.all(promises)
}
