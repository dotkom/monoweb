import { MigrationBuilder, ColumnDefinitions, PgLiteral } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = {
  id: { type: "uuid", primaryKey: true, notNull: true, default: new PgLiteral("gen_random_uuid()") },
  created_at: { type: "timestamp", notNull: true, default: new PgLiteral("now()") },
  updated_at: { type: "timestamp", notNull: true, default: new PgLiteral("now()") },
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("ow_user", {
    id: "id",
    created_at: "created_at",
    name: { type: "varchar(250)" },
    email: { type: "varchar(250)", notNull: true, unique: true },
    email_verified: { type: "timestamp" },
    password: { type: "varchar(250)", notNull: true },
    image: { type: "varchar(250)" },
  })

  pgm.createTable("session", {
    id: "id",
    created_at: "created_at",
    session_token: { type: "varchar(100)", notNull: true, unique: true },
    expires: { type: "timestamp", notNull: true },
    user_id: { type: "uuid", notNull: true, references: "ow_user", onDelete: "CASCADE" },
  })

  pgm.createTable("verification_token", {
    identifier: { type: "varchar(100)", notNull: true, unique: true },
    token: { type: "varchar(100)", notNull: true },
    expires: { type: "timestamp", notNull: true },
  })
  pgm.createIndex("verification_token", ["identifier", "token"], { unique: true })

  pgm.createTable("account", {
    id: "id",
    created_at: "created_at",
    type: { type: "varchar(100)", notNull: true },
    provider: { type: "varchar(100)", notNull: true },
    provider_account_id: { type: "varchar(100)", notNull: true },
    refresh_token: { type: "varchar(100)" },
    access_token: { type: "varchar(100)" },
    expires_at: { type: "bigint" },
    token_type: { type: "varchar(100)" },
    scope: { type: "varchar(100)" },
    id_token: { type: "varchar(100)" },
    session_state: { type: "varchar(100)" },

    user_id: { type: "uuid", notNull: true, references: "ow_user", onDelete: "CASCADE" },
  })
  pgm.createIndex("account", ["provider", "provider_account_id"], { unique: true })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("account")
  pgm.dropTable("session")
  pgm.dropTable("verification_token")
  pgm.dropTable("ow_user")
}
