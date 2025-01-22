import { sql } from "kysely";

/** @param db {import('kysely').Kysely} */
export async function up(db) {
    await db.schema
        .alterTable("interest_group")
        .addColumn("long_description", sql`text`, (col) => col.notNull().defaultTo(''))
        .addColumn("join_info", sql`text`, (col) => col.notNull().defaultTo(''))
        .execute();
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
    await db.schema
        .alterTable("interest_group")
        .dropColumn("long_description")
        .dropColumn("join_info")
        .execute();
}