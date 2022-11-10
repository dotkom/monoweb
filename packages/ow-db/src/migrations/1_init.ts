import { Generated, Kysely, sql } from "kysely"
import { Database } from "../types"

const uuid = sql`gen_random_uuid()`

export const up = async (db: Kysely<Database>) => {
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("name", "varchar(100)")
    .addColumn("email", "varchar(100)")
    .addColumn("email_verified", "timestamp")
    .addColumn("image", "varchar(250)")
    .addColumn("password", "varchar(250)", (col) => col.notNull())

  await db.schema
    .createTable("company")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("phone", "varchar(50)")
    .addColumn("email", "varchar(80)", (col) => col.notNull().unique())
    .addColumn("website", "varchar(100)", (col) => col.notNull())
    .addColumn("location", "varchar(100)")
    .addColumn("type", "varchar(100)")

  await db.schema
    .createTable("session")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("session_token", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("user_id", "uuid", (col) => col.references("user.id").onDelete("cascade").notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())

  await db.schema
    .createTable("verification_token")
    .addColumn("identifier", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("token", "varchar(100)", (col) => col.notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("verification_token_identifier_token_unique", ["identifier", "token"])

  await db.schema
    .createTable("account")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("user_id", "uuid", (col) => col.references("user.id").onDelete("cascade").notNull())
    .addColumn("type", "varchar(100)", (col) => col.notNull())
    .addColumn("provider", "varchar(100)", (col) => col.notNull())
    .addColumn("provider_account_id", "varchar(100)", (col) => col.notNull())
    .addColumn("refresh_token", "varchar(100)")
    .addColumn("access_token", "varchar(100)")
    .addColumn("expires_at", "bigint")
    .addColumn("token_type", "varchar(100)")
    .addColumn("scope", "varchar(100)")
    .addColumn("id_token", "varchar(100)")
    .addColumn("session_state", "varchar(100)")
    .addUniqueConstraint("account_provider_provider_account_id_unique", ["provider", "provider_account_id"])

  // Those below should be double checked
  await db.schema
    .createTable("event")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("title", "varchar(420)", (col) => col.notNull())
    .addColumn("subtitle", "varchar(200)")
    .addColumn("description", "text")
    .addColumn("start", "timestamp", (col) => col.notNull())
    .addColumn("end", "timestamp", (col) => col.notNull())
    .addColumn("location", "varchar(200)")
    .addColumn("organizer_id", "uuid", (col) => col.references("company.id").onDelete("set null")) // set null?
    .addColumn("public", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("image_url", "varchar(250)")
    .addColumn("status", "varchar(100)", (col) => col.notNull().defaultTo("draft"))

  await db.schema
    .createTable("committee")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade").notNull())

  await db.schema
    .createTable("event_user")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade").notNull())
    .addColumn("user_id", "uuid", (col) => col.references("user.id").onDelete("cascade").notNull())

  await db.schema
    .createTable("event_committee")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade").notNull())
    .addColumn("committee_id", "uuid", (col) => col.references("committee.id").onDelete("cascade").notNull())

  await db.schema
    .createTable("committee_user")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("committee_id", "uuid", (col)
}
