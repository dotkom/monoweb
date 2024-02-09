import { type Handler, type PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda"
import { kysely } from "@dotkomonline/db"
import { createServiceLayer } from "@dotkomonline/core"

/** Create ow_user table record upon completed sign up */
export const handler: Handler<PostConfirmationConfirmSignUpTriggerEvent> = async (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event
  }
  const sub = event.request.userAttributes.sub
  if (!sub) {
    throw new Error(`Attempted to execute PostConfirmationConfirmSignup trigger without user subject`)
  }
  const core = await createServiceLayer({ db: kysely })
  await core.userService.createUser({
    auth0Sub: sub,
    studyYear: -1,
  })
  return event
}
