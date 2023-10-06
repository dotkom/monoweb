import { env } from "@dotkomonline/env";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import { type Database } from "./types";

export * from "./types";
export { CockroachDialect } from "./cockroach";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var kysely: Kysely<Database> | undefined;
}

export const kysely =
  global.kysely ||
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: env.DATABASE_URL,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  });

if (env.NODE_ENV !== "production") {
  global.kysely = kysely;
}
