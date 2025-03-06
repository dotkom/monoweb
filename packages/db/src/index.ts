import { PrismaClient } from "@prisma/client"
import type { ITXClientDenyList } from "@prisma/client/runtime/library"

export * as schemas from "./schemas"

export const createPrisma = (databaseUrl: string) =>
  new PrismaClient({
    datasourceUrl: databaseUrl,
  })

export type DBClient = ReturnType<typeof createPrisma>
export type DBContext = Omit<DBClient, ITXClientDenyList>
