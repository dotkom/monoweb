import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { spawn } from "child_process";
import { createPrisma } from ".";

const SCHEMA_FILE_PATH = import.meta.dirname + "/../prisma/schema.prisma";
const PRISMA_BIN_PATH = import.meta.dirname + "/../node_modules/.bin/prisma"

const POSTGRES_IMAGE = "postgres:15-alpine"
const DB_USERNAME = "owuser"
const DB_PASSWORD = "owpassword"
const DB_NAME = "test"

function migrateTestDatabase(dbUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(PRISMA_BIN_PATH, ["migrate", "reset", "--force", "--skip-generate", "--schema", SCHEMA_FILE_PATH], {
      env: {
        DATABASE_URL: dbUrl
      },
      stdio: "inherit"
    })

    proc.on("exit", code => {
      if (code === 0) {
        console.log("MIGRATION COMPLETED!")
        resolve()
      } else {
        reject(`Test database migration failed with code ${code}`);
      }
    });
  })
}

export async function getTestContainerDatabase() {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withUsername(DB_USERNAME)
    .withPassword(DB_PASSWORD)
    .withDatabase(DB_NAME)
    .withReuse()
    .start()

  console.log(`Container started: ${container}`)

  const dbUrl = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${DB_NAME}`;

  await migrateTestDatabase(dbUrl)

  return createPrisma(dbUrl)
}
