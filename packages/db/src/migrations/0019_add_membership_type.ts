import { type Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("ow_user").dropColumn("study_year").execute()
}
