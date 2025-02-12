import { spawn } from "child_process"

const SCHEMA_FILE_PATH = `${import.meta.dirname}/../prisma/schema.prisma`
const PRISMA_BIN_PATH = `${import.meta.dirname}/../node_modules/.bin/prisma`

export function migrateTestDatabase(dbUrl: string) {
  return new Promise<void>((resolve, reject) => {
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
        console.log("MIGRATION COMPLETED!")
        resolve()
      } else {
        reject(`Test database migration failed with code ${code}`)
      }
    })
  })
}
