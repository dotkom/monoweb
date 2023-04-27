import { createMigrator } from "@dotkomonline/db/src/migrator"
import { getLogger } from "@dotkomonline/logger"
import { program, Argument } from "commander"
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
      logger.info(
        "Migrating...\n" +
          res.results.map((r, i) => `${i + 1}. ${r.direction} ${r.migrationName}: ${r.status}`).join("\n")
      )
    }

    if (option.withSeed) {
      const { seed } = await import("./seed")
      await seed()
    }

    if (res.error) {
      logger.warn("Error while running migrations:")
      logger.warn(JSON.stringify(res.error))
      process.exit(1);
    }

    process.exit(0);

  })

program.parse()
