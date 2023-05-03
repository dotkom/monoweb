import { Argument, program } from "commander"

import { MigrationResultSet } from "kysely"
import { createMigrator } from "@dotkomonline/db/src/migrator"
import { db } from "./db"
import { getLogger } from "@dotkomonline/logger"

export const logger = getLogger("migrator")

program
  .name("migrator")
  .description("CLI to migrate OW database")
  .addArgument(
    new Argument("<action>", "Up, down or latest")
      .choices(["up", "down", "down-all", "latest"])
      .default("latest")
      .argOptional()
  )
  .option("-s, --with-seed", "Seed the database with fake data", false)
  .option("-f, --with-fixtures", "Add predictable data to the database", false)
  .action(async (name: "up" | "down" | "down-all" | "latest", option) => {
    const migrator = createMigrator(db)
    let res: MigrationResultSet

    let handlesItself = false
    switch (name) {
      case "up": {
        res = await migrator.migrateUp()
        break
      }
      case "down": {
        res = await migrator.migrateDown()
        break
      }
      case "down-all": {
        handlesItself = true

        do {
          res = await migrator.migrateDown()
          if (res.results && !res.error) {
            res.results.forEach((r) => logger.info(`${r.direction} ${r.migrationName}: ${r.status}`))
          }
        } while (res.results && res.results.length > 0 && !res.results[0].migrationName.startsWith("0001"))

        if (res.error) {
          logger.error(`Failed to down all in migration "${res.results?.[0].migrationName}": ${res.error}`)
        }
        break
      }
      case "latest": {
        res = await migrator.migrateToLatest()
        break
      }
    }

    if (!handlesItself) {
      if (res.results) {
        const errorFmt = res.error ? `: '${res.error}'` : ""
        logger.info(
          "Migrating...\n" +
            res.results.map((r, i) => `${i + 1}. ${r.direction} ${r.migrationName}: ${r.status}${errorFmt}`).join("\n")
        )
      } else {
        logger.warn(res)
      }
    }

    if (option.withSeed) {
      const { seed } = await import("./seed")
      await seed()
    }
    if (option.withFixtures) {
      const { runFixtures } = await import("./fixture")
      await runFixtures()
      logger.info("Successfully inserted fixtures")
    }
    process.exit()
  })

program.parse()
