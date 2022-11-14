import { createMigrator } from "@dotkomonline/db"
import { program, Argument } from "commander"
import { MigrationResultSet } from "kysely"

import { db } from "./db"

program
  .name("migrator")
  .description("CLI to migrate OW database")
  .addArgument(new Argument("<option>", "Up, down or latest").choices(["up", "down", "latest"]))
  .action(async (argument: "up" | "down" | "latest") => {
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
