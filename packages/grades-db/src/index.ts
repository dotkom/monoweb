import { createRequire } from "node:module"
import type { Prisma, PrismaClient } from "./generated"
import type { DefaultArgs, ITXClientDenyList } from "./generated/runtime/library"
import { secondsToMilliseconds } from "date-fns"

const require = createRequire(import.meta.url)
const { Prisma: _Prisma, PrismaClient: _PrismaClient } = require("./generated")
export * from "./generated"

export const PrismaRuntime = _Prisma
export const PrismaClientRuntime = _PrismaClient
export type DBClient = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export type DBHandle = Prisma.TransactionClient
export type DBContext = Omit<DBClient, ITXClientDenyList>
export const createPrisma = (databaseUrl: string): DBClient =>
  new _PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["warn", "error"],
    transactionOptions: {
      timeout: secondsToMilliseconds(30),
    },
  })
