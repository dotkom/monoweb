import { PrismaClient } from ".prisma/client"
import { Chance } from "chance"
import { seedCompanies } from "./company"
import { seedPunishments } from "./punishment"
import { seedUsers } from "./users"

export type Seeder = (chance: Chance.Chance, prisma: PrismaClient) => Promise<void>

const prisma = new PrismaClient()
const chance = new Chance("onlineweb")

await seedUsers(chance, prisma)
await seedCompanies(chance, prisma)
await seedPunishments(chance, prisma)
