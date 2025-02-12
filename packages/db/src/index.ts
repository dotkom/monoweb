import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export * from "./testDatabases";
export * as dbSchemas from "./generatedSchemas"

export type DBClient = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export const createPrisma = (databaseUrl: string): DBClient => new PrismaClient({
  datasourceUrl: databaseUrl,
})
