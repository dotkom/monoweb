import config from "config"
import { DBConfig } from "./types"
import { PrismaClient } from "@dotkom/db"

const dbConfig = config.get<DBConfig>("database")

export const initPostgres = async (): Promise<PrismaClient> => {
  const client = new PrismaClient({ datasources: { db: { url: constructDatabaseUrl(dbConfig) } } })
  return client
}

const constructDatabaseUrl = (config: DBConfig) => {
  const { user, password, host, port, database } = config
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`
}
