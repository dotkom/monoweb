import { type Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("committee")
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("email", "text", (col) => col.notNull().defaultTo("kontakt@online.ntnu.no"))
    .addColumn("image", "text")
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("committee").dropColumn("description").dropColumn("email").dropColumn("image").execute()
}
