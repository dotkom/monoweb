import { createMigrator, Database } from "@dotkomonline/db"
import { program, Argument } from "commander"
import { CamelCasePlugin, Kysely, MigrationResultSet, PostgresDialect } from "kysely"
import pg from "pg"

import { env } from "./env"

program
  .name("migrator")
  .description("CLI to migrate OW database")
  .addArgument(new Argument("<option>", "Up, down or latest").choices(["up", "down", "latest"]))
  .action(async (argument: "up" | "down" | "latest") => {
    const db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
          host: env.DB_HOST,
          port: env.DB_PORT,
        }),
      }),
      plugins: [new CamelCasePlugin()],
    })
    const migrator = createMigrator(db)
    let res: MigrationResultSet
    switch (argument) {
      case "up": {
        res = await migrator.migrateUp()
        break
      }
      case "down": {
        res = await migrator.migrateDown()
        break
      }
      case "latest": {
        res = await migrator.migrateToLatest()
        break
      }
    }
    console.log(res)
    process.exit()
  })
program.parse()
