import { PrismaClient, User } from ".prisma/client"
import { Chance } from "chance"
import { seedCompanies } from "./company"
import { seedUsers } from "./users"

export type Seeder = (chance: Chance.Chance, prisma: PrismaClient) => Promise<void>

const prisma = new PrismaClient()
const chance = new Chance("onlineweb")

await seedUsers(chance, prisma)
await seedCompanies(chance, prisma)
