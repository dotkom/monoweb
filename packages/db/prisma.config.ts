import { defineConfig } from "prisma/config"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "./prisma/migrations/",
  },
})
