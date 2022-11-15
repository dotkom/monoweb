import { Database } from "@dotkomonline/db"
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely"
import pg from "pg"

import type { inferAsyncReturnType } from "@trpc/server"
import * as trpcExpress from "@trpc/server/adapters/express"

import { env } from "./env"
import { initUserRepository } from "./modules/auth/user-repository"
import { initUserService } from "./modules/auth/user-service"
import { initEventRepository } from "./modules/event/event-repository"
import { initEventService } from "./modules/event/event-service"

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  console.log({ req, res })
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
  // Repositories
  const userRepository = initUserRepository(db)
  const eventRepository = initEventRepository(db)

  // Services
  const userService = initUserService(userRepository)
  const eventService = initEventService(eventRepository)

  return {
    userService,
    eventService,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
