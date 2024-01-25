import { createServiceLayer } from "@dotkomonline/core"
import { type Database } from "@dotkomonline/db"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import "dotenv/config"
import { Argument, program } from "commander"

const choices = ["get-job-postings", "get-company"] as const
type Choices = (typeof choices)[number]

program
  .name("short")
  .description("CLI stuff")
  .addArgument(new Argument("<action>", "what to do").choices(choices))
  .action(async (name: Choices) => {
    console.log(name)
    const db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
      plugins: [new CamelCasePlugin()],
    })
    const service = await createServiceLayer({ db })
    if (name === "get-company") {
      const all = await service.companyService.getCompanies(3)
      console.log(all)
    }

    if (name === "get-job-postings") {
      const all = await service.jobListingService.getAll(10)
      console.log(all)
    }
  })

program.parse()
