import { Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("offline", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", sql`text`, (col) => col.notNull())
    .addColumn("published", sql`timestamptz`, (col) => col.notNull())
    .addColumn("file", sql`text`, (col) => col.notNull())
    .addColumn("image", sql`text`, (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("offline").execute()
}
