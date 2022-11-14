import { Database } from "@dotkomonline/db"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"

import { env } from "./env"

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})

const res = await db.selectFrom("ow_user").selectAll().execute()
console.log(res)

// if (process.env.NODE_ENV === "development") {
//   const port = Number(process.env.API_PORT || 4000)
//   const server = createServer()
//   logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
//   server.listen(port)
// }
