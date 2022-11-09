import { Seeder } from "."
import { User } from ".prisma/client"

export const seedUsers: Seeder = async (chance, prisma) => {
  // Generates the required input of random varables
  const userInserts = [...new Array(50)].map(() => {
    const firstName = chance.first()
    const lastName = chance.last()

    const payload = {
      name: `${firstName.toLocaleLowerCase()}_${lastName.toLocaleLowerCase()}`,
      firstName,
      lastName,
      emailVerified: chance.date(),
      image: chance.avatar({ protocol: "https" }),
      email: chance.email(),
    }
    return payload
  })

  const promises: Promise<User>[] = userInserts.map((payload) =>
    prisma.user.upsert({
      where: { email: payload.email },
      update: payload,
      create: payload,
    })
  )
  await Promise.all(promises)
}
