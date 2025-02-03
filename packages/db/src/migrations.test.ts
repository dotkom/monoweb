import { PostgreSqlContainer } from "@testcontainers/postgresql"
import chalk from "chalk"
import { type Kysely, sql } from "kysely"
import { expect, test } from "vitest"
import { type Database, createKysely, createMigrator } from "./index"

async function getCustomTypeNames(kysely: Kysely<Database>) {
  const result = await kysely.executeQuery<{ typname: string }>(
    sql`SELECT typname FROM pg_type t WHERE typcategory = 'E'
  `.compile(kysely)
  )

  return result.rows.map((row) => row.typname)
}

async function resetTestDatabase(kysely: Kysely<Database>) {
  // This is a dangerous operation, so we want to make sure we are in the right database
  const result = await kysely.executeQuery<{ dbName: string }>(
    sql`SELECT current_database() AS db_name`.compile(kysely)
  )

  if (result.rows[0].dbName !== "migration_test") {
    throw new Error("Database is not migration_test")
  }

  await kysely.executeQuery(sql`drop schema public cascade`.compile(kysely))
  await kysely.executeQuery(sql`create schema public`.compile(kysely))
}

const container = await new PostgreSqlContainer("postgres:15-alpine")
  .withExposedPorts(5432)
  .withUsername("local")
  .withPassword("local")
  .withDatabase("migration_test")
  .withReuse()
  .start()

const kysely = await createKysely(container.getConnectionUri())
await resetTestDatabase(kysely)
const migrator = createMigrator(kysely, new URL("./migrations", import.meta.url))

const migrations = await migrator.getMigrations()

for (const migration of migrations) {
  test(`Migration ${migration.name} is reversible`, async () => {
    const customTypesBefore = new Set(await getCustomTypeNames(kysely))
    const tablesBefore = new Map((await kysely.introspection.getTables()).map((table) => [table.name, table]))

    await migration.migration.up(kysely)

    // Note: if there is no down migrations, this will likely fail the checks, but that's fine because there should be
    await migration.migration.down?.(kysely)

    const customTypesAfter = new Set(await getCustomTypeNames(kysely))
    const tablesAfter = new Map((await kysely.introspection.getTables()).map((table) => [table.name, table]))

    expect
      .soft(
        customTypesAfter,
        chalk.red("Custom types added during migrate up were not removed when migrating back down")
      )
      .toEqual(customTypesBefore)

    expect
      .soft(
        customTypesAfter,
        chalk.red("Custom types removed during migrate up were not added back when migrating back up")
      )
      .toEqual(customTypesBefore)

    expect
      .soft(tablesAfter.keys(), chalk.red("Tables added during migrate up were not removed when migrating back down"))
      .toEqual(tablesBefore.keys())

    expect
      .soft(
        tablesBefore.keys(),
        chalk.red("Tables removed during migrate up were not added back when migrating back up")
      )
      .toEqual(tablesAfter.keys())

    for (const [tableName, tableBefore] of tablesBefore) {
      const tableAfter = tablesAfter.get(tableName)

      if (!tableAfter) {
        continue
      }

      const columnNamesBefore = Array.from(tableBefore.columns.map((column) => column.name))
      const columnNamesAfter = Array.from(tableAfter.columns.map((column) => column.name))

      expect
        .soft(
          columnNamesAfter,
          chalk.red(`Columns added to table ${tableName} during migrate up were not removed when migrating back down`)
        )
        .toEqual(columnNamesBefore)
    }

    await migration.migration.up(kysely)
  })
}
