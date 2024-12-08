/** @param db {import('kysely').Kysely} */
export async function up(db) {
    await db.schema
        .alterTable("interest_group")
        .addColumn("long_description", "text")
        .addColumn("join_info", "text")
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