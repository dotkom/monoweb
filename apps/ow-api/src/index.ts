import { getLogger } from "@dotkomonline/logger"
import { Kysely, PostgresDialect, Generated, ColumnType, Selectable, Insertable, Updateable } from "kysely"
import pg from "pg"

import { createServer } from "./server"

const logger = getLogger(import.meta.url)

interface CompanyTable {
  id: Generated<string>
  name: string
  description: string
  phone: string | undefined
  email: string
  website: string
  location: string | null
  type: string | null
}

interface Database {
  company: CompanyTable
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      user: "ow",
      password: "owpassword123",
      host: "localhost",
      database: "ow",
      port: 6543,
    }),
  }),
})

const { id } = await db
  .insertInto("company")
  .values({
    name: "hei",
    description: "AJ",
    email: "asdj",
    website: "asd",
    location: "askd",
    phone: "ajksld",
    type: "ur mome",
  })
  .returning("id")
  .executeTakeFirstOrThrow()

const a = await db.selectFrom("company").selectAll().execute()
a[0].description

// if (process.env.NODE_ENV === "development") {
//   const port = Number(process.env.API_PORT || 4000)
//   const server = createServer()
//   logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
//   server.listen(port)
// }
