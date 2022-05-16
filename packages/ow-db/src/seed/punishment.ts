import { Seeder } from "."
import { PunishmentType } from "@prisma/client"

export const seedPunishments: Seeder = async (chance, prisma) => {
  const seedInserts = [...new Array(10)].map(() => ({
    name: chance.name(),
    type: chance.pickone([PunishmentType.MARK, PunishmentType.SUSPENSION]),
    date: chance.date(),
  }))

  const promises = seedInserts.map((payload) =>
    prisma.punishment.create({data: {
        type: payload.type,
        start_date: payload.date
    }})
  )

  await Promise.all(promises)
}
