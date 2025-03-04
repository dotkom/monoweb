import { PrismaClient } from "@prisma/client"

export * as schemas from "./schemas"

export const createPrisma = (databaseUrl: string) =>
  new PrismaClient({
    datasourceUrl: databaseUrl,
  })

export type DBClient = ReturnType<typeof createPrisma>
