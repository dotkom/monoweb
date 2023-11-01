import { type Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

// Kysely reccomends using "any" in migrations

export async function up(db: Kysely<any>): Promise<void> {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  await createTableWithDefaults("ow_user", { id: true, createdAt: true }, db.schema).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("ow_user").execute()
}
