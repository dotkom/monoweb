import type { Handler, PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda"
import { SendEmailCommand, SES } from "@aws-sdk/client-ses"

const ses = new SES()

const sendTheEmail = async (to: string, body: string) => {
  const eParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: "Cognito Identity Provider registration completed",
      },
    },
    // Replace source_email with your SES validated email address
    Source: "dotkom@online.ntnu.no",
  }
  try {
    await ses.send(new SendEmailCommand(eParams))
  } catch (err) {
    console.log(err)
  }
}

export const handler: Handler<PostConfirmationConfirmSignUpTriggerEvent> = async (event) => {
  if (event.request.userAttributes.email) {
    await sendTheEmail(
      event.request.userAttributes.email,
      `Congratulations ${event.userName}, you have been confirmed.`
    )
  }
  return event
}
