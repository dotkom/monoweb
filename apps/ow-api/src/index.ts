import { getLogger } from "@dotkomonline/logger"
import {
  Kysely,
  PostgresDialect,
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
  CamelCasePlugin,
} from "kysely"
import pg from "pg"
import { v4 } from "uuid"

import { createServer } from "./server"

const logger = getLogger(import.meta.url)


const user = await db
  .selectFrom("Company")
  .selectAll()
  .executeTakeFirstOrThrow()

console.log(user)

// const { id } = await db
//   .insertInto("Company")
//   .values({
//     id: v4(),
//     name: "hei",
//     description: "AJ",
//     email: "asdj",
//     website: "asd",
//     location: "askd",
//     phone: "ajksld",
//     type: "ur mome",
//   })
//   .returning("id")
//   .executeTakeFirstOrThrow()

//   console.log(id)
console.log(await db.selectFrom("Company").selectAll().where("Company.email", "=", "asdj").executeTakeFirstOrThrow())

// if (process.env.NODE_ENV === "development") {
//   const port = Number(process.env.API_PORT || 4000)
//   const server = createServer()
//   logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
//   server.listen(port)
// }
