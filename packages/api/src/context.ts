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
import { initCommitteeService } from "./modules/committee/committee-service"
import { initCommitteeRepository } from "./modules/committee/committee-repository"
import { Configuration, OAuth2Api as HydraApiClient } from "@ory/client"
import { AttendanceRepositoryImpl } from "./modules/event/attendee-repository"
import { AttendServiceImpl } from "./modules/event/attendee-service"

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
  const committeeRepository = initCommitteeRepository(db)
  const attendanceRepository = new AttendanceRepositoryImpl(db)

  // Services
  const userService = initUserService(userRepository, hydraAdmin)
  const eventService = initEventService(eventRepository, attendanceRepository)
  const attendService = new AttendServiceImpl(attendanceRepository)
  const committeeService = initCommitteeService(committeeRepository)
  return {
    session: opts.session,
    userService,
    eventService,
    committeeService,
    attendService,
  }
}

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts)

  return await createContextInner({
    session,
  })
}

export type Context = inferAsyncReturnType<typeof createContext>
