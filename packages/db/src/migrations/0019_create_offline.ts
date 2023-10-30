import { Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("offline", { id: true, createdAt: true }, db.schema)
    .addColumn("title", sql`character varying(1000)`, (col) => col.notNull())
    .addColumn("published", sql`timestamp with time zone`, (col) => col.notNull())
    .addColumn("file", sql`character varying(255)`, (col) => col.notNull())
    .addColumn("image", sql`character varying(255)`, (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("offline").execute()
}
