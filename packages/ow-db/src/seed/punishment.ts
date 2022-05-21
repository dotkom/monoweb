import { Seeder } from "."
import { PunishmentType } from "@prisma/client"
import { initUserRepository } from "../../../../apps/ow-api/src/modules/auth/user-repository"

export const seedPunishments: Seeder = async (chance, prisma) => {
  const rulesetID = "3ba59ac4-76a5-4b75-a3ed-cdcc68c05e03"

  const punishmentRuleInsert = { id: rulesetID, title: chance.name(), description: chance.paragraph(), duration: 20 }
  await prisma.punishmentRuleSet.upsert({
    where: { id: rulesetID },
    update: punishmentRuleInsert,
    create: punishmentRuleInsert,
  })

  const users = await prisma.user.findMany({ take: 10 })

  const seedInserts = [...new Array(10)].map(() => ({
    name: chance.name(),
    type: chance.pickone([PunishmentType.MARK, PunishmentType.SUSPENSION]),
  }))

  const promises = seedInserts.map((payload) =>
    prisma.punishment.create({
      data: {
        type: payload.type,
        ruleset_id: rulesetID,
        user_id: chance.pickone(users).id,
      },
    })
  )

  await Promise.all(promises)
}
