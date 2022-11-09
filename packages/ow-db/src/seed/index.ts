import { Chance } from "chance"

import { seedCompanies } from "./company"
import { seedUsers } from "./users"
import { PrismaClient } from ".prisma/client"

export type Seeder = (chance: Chance.Chance, prisma: PrismaClient) => Promise<void>

const prisma = new PrismaClient()
const chance = new Chance("onlineweb")

await seedUsers(chance, prisma)
await seedCompanies(chance, prisma)
