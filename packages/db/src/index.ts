import { createRequire } from "node:module"
import type { Prisma, PrismaClient } from "@prisma/client"
import type { ITXClientDenyList } from "@prisma/client/runtime/client"
import type { DefaultArgs } from "@prisma/client/runtime/library"

const require = createRequire(import.meta.url)
const { Prisma: _Prisma, PrismaClient: _PrismaClient } = require("@prisma/client")
export type * from "@prisma/client"

export const PrismaRuntime = _Prisma
export const PrismaClientRuntime = _PrismaClient
export type DBClient = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export const createPrisma = (databaseUrl: string): DBClient =>
  new _PrismaClient({
    datasourceUrl: databaseUrl,
  })

export type DBContext = Omit<DBClient, ITXClientDenyList>
