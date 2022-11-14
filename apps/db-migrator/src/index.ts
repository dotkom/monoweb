import { createMigrator } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { program, Argument, Option } from "commander"
import { MigrationResultSet } from "kysely"

import { db } from "./db"

export const logger = getLogger("migrator")

program
  .name("migrator")
  .description("CLI to migrate OW database")
  .addArgument(
    new Argument("<action>", "Up, down or latest").choices(["up", "down", "latest"]).default("latest").argOptional()
  )
  .option("-s, --with-seed", "Seed the database with fake data", false)
  .action(async (name: "up" | "down" | "latest", option) => {
    const migrator = createMigrator(db)
    let res: MigrationResultSet
    switch (name) {
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
    if (res.results) {
      res.results.forEach((r) => logger.info(r))
    } else if (res.error) {
      logger.error(res.error)
    }

    if (option.withSeed) {
      const { seed } = await import("./seed")
      await seed()
    }
    process.exit()
  })

program.parse()
