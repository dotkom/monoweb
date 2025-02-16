import { createPrisma } from "."

const SCHEMA_FILE_PATH = `${import.meta.dirname}/../prisma/schema.prisma`
const PRISMA_BIN_PATH = `${import.meta.dirname}/../node_modules/.bin/prisma`

const POSTGRES_IMAGE = "postgres:15-alpine"
const DB_USERNAME = "owuser"
const DB_PASSWORD = "owpassword"
const DB_NAME = "test"

async function getTestContainerDatabase() {
  const PostgreSqlContainer = (await import("@testcontainers/postgresql")).PostgreSqlContainer
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withUsername(DB_USERNAME)
    .withPassword(DB_PASSWORD)
    .withDatabase(DB_NAME)
    .withReuse()
    .start()

  return `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${DB_NAME}`
}

async function migrateTestDatabase(dbUrl: string) {
  const spawn = (await import("node:child_process")).spawn

  return await new Promise<void>(async (resolve, reject) => {
    const proc = spawn(
      PRISMA_BIN_PATH,
      ["migrate", "reset", "--force", "--skip-generate", "--schema", SCHEMA_FILE_PATH],
      {
        env: {
          DATABASE_URL: dbUrl,
          NODE_ENV: "development",
        },
        stdio: "inherit",
      }
    )

    proc.on("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(`Test database migration failed with code ${code}`)
      }
    })
  })
}

export async function getTestClient() {
  const dbUrl = await getTestContainerDatabase()

  await migrateTestDatabase(dbUrl);

  return createPrisma(dbUrl)
}
