import { PrismaClient, User } from ".prisma/client"
import { Seeder } from "."

export const seedUsers: Seeder = async (chance, prisma) => {
  // Generates the required input of random varables
  const userInserts = [...new Array(50)].map(() => {
    const first_name = chance.first()
    const last_name = chance.last()

    const payload = {
      username: `${first_name.toLocaleLowerCase()}_${last_name.toLocaleLowerCase()}`,
      first_name,
      last_name,
      email: chance.email(),
      password: chance.string({ length: 12 }),
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
