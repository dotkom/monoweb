import { Database } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"

const logger = getLogger(import.meta.url)

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host: "localhost",
      port: 6543,
      database: "ow",
      user: "ow",
      password: "owpassword123",
    }),
  }),
  plugins: [new CamelCasePlugin()]
})


const res = await db.selectFrom("owUser").selectAll().execute()
console.log(res)

// if (process.env.NODE_ENV === "development") {
//   const port = Number(process.env.API_PORT || 4000)
//   const server = createServer()
//   logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
//   server.listen(port)
// }
