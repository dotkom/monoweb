import { Database } from "@dotkomonline/db"
import { getServerSession, Session } from "@dotkomonline/auth"
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely"
import { Pool } from "pg"

import type { inferAsyncReturnType } from "@trpc/server"
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"

import { initUserRepository } from "./modules/auth/user-repository"
import { initUserService } from "./modules/auth/user-service"
import { initEventRepository } from "./modules/event/event-repository"
import { initEventService } from "./modules/event/event-service"
import { Configuration, OAuth2Api as HydraApiClient } from "@ory/client"
import { initMarkRepository } from "./modules/marks/mark-repository"
import { initMarkService } from "./modules/marks/mark-service"
import { initPersonalMarkRepository } from "./modules/marks/personal-mark-repository"
import { initPersonalMarkService } from "./modules/marks/personal-mark-service"

type CreateContextOptions = {
  session: Session | null
}

export const createContextInner = async (opts: CreateContextOptions) => {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL as string,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })

  const hydraAdmin = new HydraApiClient(
    new Configuration({
      basePath: process.env.HYDRA_ADMIN_URL,
    })
  )

  const userRepository = initUserRepository(db)
  const eventRepository = initEventRepository(db)
  const markRepository = initMarkRepository(db)
  const personalMarkRepository = initPersonalMarkRepository(db)

  // Services
  const userService = initUserService(userRepository, hydraAdmin)
  const eventService = initEventService(eventRepository)
  const markService = initMarkService(markRepository)
  const personalMarkService = initPersonalMarkService(personalMarkRepository, markService)

  return {
    session: opts.session,
    userService,
    eventService,
    markService,
    personalMarkService,
  }
}

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts)

  return await createContextInner({
    session,
  })
}

export type Context = inferAsyncReturnType<typeof createContext>
