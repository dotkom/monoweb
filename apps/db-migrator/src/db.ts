import { CockroachDialect, type Database } from "@dotkomonline/db";
import { env } from "@dotkomonline/env";
import { CamelCasePlugin, Kysely } from "kysely";
import pg from "pg";

export const db = new Kysely<Database>({
  dialect: new CockroachDialect({
    pool: new pg.Pool({
      connectionString: env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
});
