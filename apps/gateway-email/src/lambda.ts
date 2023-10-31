import { type Handler, type APIGatewayProxyEventV2, type APIGatewayProxyResultV2 } from "aws-lambda"
import { HelloWorldTemplate, InvalidTemplateArguments, type Template } from "@dotkomonline/emails"
import { z, ZodError } from "zod"
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"

const ses = new SESClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates = [HelloWorldTemplate] satisfies Template<any>[]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateMap = templates.reduce<Record<string, Template<any>>>((acc, curr) => {
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

export const handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const xEmailToken = event.headers["x-email-token"]
  if (!xEmailToken) {
    return { statusCode: 401, body: "Missing API Token" }
  }
  if (xEmailToken !== process.env.EMAIL_TOKEN) {
    return { statusCode: 403, body: "Invalid API Token" }
  }
  try {
    const json = JSON.parse(event.body ?? "{}")
    const request = requestSchema.parse(json)
    const template = templateMap[request.template]
    if (!template) {
      return { statusCode: 400, body: "Unknown template name" }
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
    return { statusCode: 201 }
  } catch (err) {
    if (err instanceof ZodError) {
      return { statusCode: 400, body: "Provided arguments don't match email input schema" }
    } else if (err instanceof InvalidTemplateArguments) {
      return { statusCode: 400, body: "Arguments provided to template don't match the template's arguments" }
    }
    console.error(err)
    return { statusCode: 500 }
  }
}
