import { defineConfig } from "prisma/config"

const commandNeedsDatabase = process.argv.some((argument) => {
  return argument === "migrate" || argument === "db" || argument === "studio"
})

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
})
