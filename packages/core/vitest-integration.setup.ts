import { beforeEach, beforeAll, afterEach } from "vitest"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { createMigrator, createKysely, Database } from "@dotkomonline/db"
import { Environment, createEnvironment } from "@dotkomonline/env"
import { exec } from "child_process"
import { Kysely } from "kysely"
import util from "util"

const promiseExec = util.promisify(exec)

const password = "local"
const username = "local"
const database = "main"

const containers: StartedPostgreSqlContainer[] = []

let container: StartedPostgreSqlContainer
let kysely: Kysely<Database>
let env: Environment

beforeAll(async () => {
  container = await new PostgreSqlContainer("public.ecr.aws/z5h0l8j6/dotkom/pgx-ulid:0.1.3")
    .withExposedPorts(5432)
    .withUsername(username)
    .withPassword(password)
    .withDatabase(database)
    .start()

  containers.push(container)
  process.env.DATABASE_URL = container.getConnectionUri()
}, 30000)

beforeEach(async () => {
  env = createEnvironment()
  kysely = createKysely(env)
  const migrator = createMigrator(kysely, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  const result = await migrator.migrateToLatest()
  if (result.error) {
    console.warn(`Error running migrations in test: ${result.error}`)
  }
  await kysely.destroy()
})

afterEach(async () => {
  try {
    const command = `echo "drop database ${database}; create database ${database};" | PGPASSWORD=${password} psql -h ${container.getHost()} -p ${container.getMappedPort(
      5432
    )} -U ${username} -d postgres`

    const { stderr, stdout } = await promiseExec(command)

    if (stderr) {
      console.error(`Error running command: ${stderr}`)
      return
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error running command: ${error.message}`)
      return
    }
  }
})


process.on("beforeExit", async () => {
  await Promise.all(containers.map(async (container) => container.stop()))
})
