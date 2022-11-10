/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder } from "node-pg-migrate"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("company", {
    id: "id",
    created_at: "created_at",
    name: { type: "varchar(100)", notNull: true },
    description: { type: "text", notNull: true },
    phone: { type: "varchar(69)" },
    email: { type: "varchar(69)", notNull: true, unique: true },
    website: { type: "varchar(100)", notNull: true },
    location: { type: "varchar(100)" },
    type: { type: "varchar(100)" },
  })

  pgm.createTable("committee", {
    id: "id",
    created_at: "created_at",
    updated_at: "updated_at",
    name: { type: "varchar(100)", notNull: true },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("company")
  pgm.dropTable("committee")
}
