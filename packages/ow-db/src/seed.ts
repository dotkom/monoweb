import Chance from "chance"
import { CamelCasePlugin, Insertable, Kysely, PostgresDialect } from "kysely"
import pg from "pg"

import { Database } from "./types"
import { UserTable } from "./types/user"

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host: "localhost",
      port: 6543,
      user: "ow",
      database: "ow",
      password: "owpassword123",
    }),
  }),
  plugins: [new CamelCasePlugin()],
})

const chance = new Chance()
const values: Insertable<UserTable>[] = []
for (let i = 0; i < 5; i++) {
  values.push({
    name: chance.name(),
    email: chance.email(),
    password: chance.string({ length: 12 }),
  })
}

const res = await db.insertInto("ow_user").values(values).returningAll().execute()
console.log(res)

process.exit()
