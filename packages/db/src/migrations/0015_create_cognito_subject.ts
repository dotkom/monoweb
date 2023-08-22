import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("cognito_sub", "uuid", (col) => col.notNull().unique())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("ow_user").dropColumn("cognito_sub").execute()
}
