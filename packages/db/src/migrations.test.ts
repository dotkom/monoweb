import { PostgreSqlContainer } from "@testcontainers/postgresql"
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
      .soft(customTypesAfter, "Custom types were not the same after migrating up and then back down")
      .toEqual(customTypesBefore)

    expect
      .soft(tablesAfter.keys(), "Tables were not the same after migrating up and then back down")
      .toEqual(tablesBefore.keys())

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
          `Columns for table ${tableName} were not the same after migrating up and then back down`
        )
        .toEqual(columnNamesBefore)

      for (const columnName of columnNamesBefore) {
        const columnBefore = tableBefore.columns.find((column) => column.name === columnName)
        const columnAfter = tableAfter.columns.find((column) => column.name === columnName)

        expect
          .soft(
            columnAfter,
            `Column ${columnName} for table ${tableName} was not the same after migrating up and then back down`
          )
          .toEqual(columnBefore)
      }
    }

    await migration.migration.up(kysely)
  })
}
