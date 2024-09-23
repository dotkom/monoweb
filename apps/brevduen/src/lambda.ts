import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import {
  HelloWorldTemplate,
  InterestFormForBedkomTemplate,
  InterestFormForCompanyTemplate,
  InvalidTemplateArguments,
  InvoiceFormForBedKomTemplate,
  type Template,
} from "@dotkomonline/emails"
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from "aws-lambda"
import { ZodError, z } from "zod"

const ses = new SESClient()

const templates = [
  HelloWorldTemplate,
  InterestFormForBedkomTemplate,
  InterestFormForCompanyTemplate,
  InvoiceFormForBedKomTemplate,
  // biome-ignore lint/suspicious/noExplicitAny: this should be any
] satisfies Template<any>[]

// biome-ignore lint/suspicious/noExplicitAny: this too, should be any
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
    if (!template.name) {
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
      return { statusCode: 400, body: `Provided arguments don't match email input schema: ${err.message}` }
    }
    if (err instanceof InvalidTemplateArguments) {
      return {
        statusCode: 400,
        body: `Arguments provided to template don't match the template's argument schema: ${err.message}`,
      }
    }
    console.error(err)
    return { statusCode: 500 }
  }
}
