import type { Handler, APIGatewayProxyEventV2 } from "aws-lambda"
import { HelloWorldTemplate, InvalidTemplateArguments, type Template } from "@dotkomonline/emails"
import { z, ZodError } from "zod"
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"

const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  },
})

const templates = [HelloWorldTemplate] satisfies Template<unknown>[]
const templateMap = templates.reduce<Record<string, Template<unknown>>>((acc, curr) => {
  acc[curr.displayName] = curr
  return acc
}, {})

const requestSchema = z.object({
  template: z.string().nonempty(),
  source: z.string().email(),
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()),
  bcc: z.array(z.string().email()),
  subject: z.string().nonempty(),
  arguments: z.any(),
  replyTo: z.array(z.string().email()),
})

export const handler: Handler<APIGatewayProxyEventV2> = async (event) => {
  const xEmailToken = event.headers["x-email-token"]
  if (!xEmailToken) {
    return { statusCode: 401 }
  }
  if (xEmailToken !== process.env.EMAIL_TOKEN) {
    return { statusCode: 403 }
  }
  try {
    const json = JSON.parse(event.body ?? "{}")
    const request = requestSchema.parse(json)
    const template = templateMap[request.template]
    if (!template) {
      return { statusCode: 400 }
    }
    const html = template(request.arguments)
    const command = new SendEmailCommand({
      Source: request.source,
      ReplyToAddresses: request.replyTo,
      Destination: {
        ToAddresses: request.to,
        CcAddresses: request.cc,
        BccAddresses: request.bcc,
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: request.subject,
        },
      },
    })
    await ses.send(command)
  } catch (err) {
    if (err instanceof SyntaxError || err instanceof ZodError || err instanceof InvalidTemplateArguments) {
      return { statusCode: 400 }
    }
    console.error(err)
    return { statusCode: 500 }
  }
}
