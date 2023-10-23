import { Handler, PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import { Database } from "@dotkomonline/db"
import pg from "pg"
import { createServiceLayer } from "@dotkomonline/core"

// Do not import from @dotkomonline/db because we don't want to provide all
// environment variables down to the lambda.
const createKysely = (connectionString: string) =>
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })

/** Create ow_user table record upon completed sign up */
export const handler: Handler<PostConfirmationConfirmSignUpTriggerEvent> = async (event) => {
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event
  }
  const sub = event.request.userAttributes.sub
  if (!sub) {
    throw new Error(`Attempted to execute PostConfirmationConfirmSignup trigger without user subject`)
  }
  const kysely = createKysely(process.env.DATABASE_URL!)
  const core = await createServiceLayer({ db: kysely })
  await core.userService.createUser({
    cognitoSub: sub,
  })
  return event
}
