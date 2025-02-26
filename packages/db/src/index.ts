import { type Prisma, PrismaClient } from "@prisma/client"
import type { DefaultArgs } from "@prisma/client/runtime/library"

export * as schemas from "./schemas"

export type DBClient = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export const createPrisma = (databaseUrl: string): DBClient =>
  new PrismaClient({
    datasourceUrl: databaseUrl,
  })
