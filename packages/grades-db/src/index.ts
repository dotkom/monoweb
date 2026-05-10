import { PrismaPg } from "@prisma/adapter-pg"
import { type Prisma, PrismaClient } from "../generated/prisma/client"

export type DBClient = ReturnType<typeof createPrisma>
export type DBHandle = Prisma.TransactionClient

export const createPrisma = (databaseUrl: string) => {
  const adapter = new PrismaPg({ connectionString: databaseUrl })

  return new PrismaClient({ adapter })
}

export * as sql from "../generated/prisma/sql"
export * from "../generated/prisma/client"
