import { type Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("job_listing", { id: true, createdAt: true }, db.schema)
    .addColumn("company_id", sql`ulid`, (col) => col.references("company.id").onDelete("cascade"))
    .addColumn("title", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("ingress", sql`character varying(250)`, (col) => col.notNull())
    .addColumn("description", sql`text`, (col) => col.notNull())
    .addColumn("start", sql`timestamp with time zone`, (col) => col.notNull())
    .addColumn("end", sql`timestamp with time zone`, (col) => col.notNull())
    .addColumn("featured", sql`boolean`, (col) => col.notNull())
    .addColumn("deadline", sql`timestamp with time zone`)
    .addColumn("employment", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("application_link", sql`character varying(200)`)
    .addColumn("application_email", sql`character varying(254)`)
    .addColumn("deadline_asap", sql`boolean`, (col) => col.notNull())
    .execute()

  await createTableWithDefaults("job_listing_location", { id: true, createdAt: true }, db.schema)
    .addColumn("name", sql`text`, (col) => col.notNull().unique())
    .execute()

  await createTableWithDefaults("job_listing_location_link", { id: true, createdAt: true }, db.schema)
    .addColumn("job_listing_id", sql`ulid`, (col) => col.references("job_listing.id").onDelete("cascade"))
    .addColumn("location_id", sql`ulid`, (col) => col.references("job_listing_location.id").onDelete("cascade"))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("job_listing_location_link").execute()
  await db.schema.dropTable("job_listing_location").execute()
  await db.schema.dropTable("job_listing").execute()
}
