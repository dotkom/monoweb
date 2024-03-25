import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  db.schema.createType("feedback_question_type").asEnum(["text", "multiple_choice"]).execute()

  await createTableWithDefaults("feedback", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("deadline", "timestamptz", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("feedback_question", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("question_text", "text", (col) => col.notNull())
    .addColumn("question_type", sql`feedback_question_type`, (col) => col.notNull())
    .addColumn("feedback_id", sql`ulid`, (col) => col.references("feedback.id").onDelete("cascade"))
    .execute()

  await createTableWithDefaults("feedback_answer", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("feedback_question_id", sql`ulid`, (col) => col.references("feedback_question.id").onDelete("cascade"))
    .addColumn("user_id", sql`ulid`, (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("answer", "json", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("feedback_question_company", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("question_id", sql`ulid`, (col) => col.references("feedback_question.id").onDelete("cascade"))
    .addColumn("company_id", sql`ulid`, (col) => col.references("company.id").onDelete("cascade"))
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("feedback_question_company").execute()
  await db.schema.dropTable("feedback_answer").execute()
  await db.schema.dropTable("feedback_question").execute()
  await db.schema.dropTable("feedback").execute()
  await db.schema.dropType("feedback_question_type").execute()
}
