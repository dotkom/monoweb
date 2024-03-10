import { sql } from "kysely"
import { env } from "@dotkomonline/env"
import { createKysely } from "@dotkomonline/db"

export async function resetDatabase() {
  // extract database name from DATABASE_URL. This is a bit hacky, but it works.
  let dbName = env.DATABASE_URL.split("/").pop()
  if (!dbName) {
    throw new Error("Could not find database name")
  }

  // check if there is any options in the database name
  const dbNameParts = dbName.split("?")

  // if there are options, remove them
  if (dbNameParts.length > 1) {
    dbName = dbNameParts[0]
  }

  // connect to default database to drop and recreate application database
  const defaultDb = createKysely({
    ...env,
    DATABASE_URL: `${env.DATABASE_URL.replace(dbName, "postgres")}?sslmode=require`,
  })

  try {
    await defaultDb.executeQuery(sql`drop database if exists ${sql.ref(dbName)}`.compile(defaultDb))
    await defaultDb.executeQuery(sql`create database ${sql.ref(dbName)}`.compile(defaultDb))
    await defaultDb.destroy()
  } catch (e) {
    console.error("Error resetting database")
    console.error(e)
  }
}
