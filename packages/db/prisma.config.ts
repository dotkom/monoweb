import { defineConfig } from "prisma/config"

const commandsThatNeedDatabase = new Set(["migrate", "db", "studio", "--sql"])
const commandNeedsDatabase = process.argv.some((argument) => commandsThatNeedDatabase.has(argument))

if (commandNeedsDatabase && process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database URL")
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "./prisma/migrations/",
  },
  typedSql: {
    path: "./prisma/sql",
  },
})
