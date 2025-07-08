import { createRequire } from "node:module"
import type { Prisma, PrismaClient } from "@prisma/client"
import type { DefaultArgs, ITXClientDenyList } from "@prisma/client/runtime/library"

const require = createRequire(import.meta.url)
const { Prisma: _Prisma, PrismaClient: _PrismaClient } = require("@prisma/client")
export type * from "@prisma/client"

export const PrismaRuntime = _Prisma
export const PrismaClientRuntime = _PrismaClient
export type DBClient = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export type DBHandle = Prisma.TransactionClient
export type DBContext = Omit<DBClient, ITXClientDenyList>
export const createPrisma = (databaseUrl: string): DBClient =>
  new _PrismaClient({
    datasourceUrl: databaseUrl,
  })
