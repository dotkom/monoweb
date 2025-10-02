// Always import Sentry instrumentation at the top of the entrypoint
import "./instrumentation"

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import {
  HelloWorldTemplate,
  InterestFormForBedkomTemplate,
  InterestFormForCompanyTemplate,
  InvalidTemplateArguments,
  InvoiceFormForBedKomTemplate,
  type Template,
} from "@dotkomonline/emails"
import { getLogger } from "@dotkomonline/logger"
import fastify from "fastify"
import { ZodError, z } from "zod"
import { env } from "./env"

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
  source: z.email(),
  to: z.array(z.email()),
  cc: z.array(z.email()),
  bcc: z.array(z.email()),
  subject: z.string().nonempty(),
  arguments: z.any(),
  replyTo: z.array(z.email()),
})

const server = fastify()
const logger = getLogger("brevduen")

server.get("/health", (_, res) => {
  res.send({ status: "ok" })
})

server.post("/integrations/email", async (req, res) => {
  const xEmailToken = req.headers["x-email-token"]
  if (Array.isArray(xEmailToken) || xEmailToken === undefined) {
    logger.warn("blocked unauthenticated http request")
    return res.status(401).send({ error: "Missing API Token " })
  }
  if (xEmailToken !== env.EMAIL_TOKEN) {
    logger.warn(`blocked unauthorized http request with token: ${xEmailToken}`)
    return res.status(403).send({ error: "Invalid API Token" })
  }

  try {
    const request = requestSchema.parse(req.body)
    const template = templateMap[request.template]
    if (!template.name) {
      return res.status(400).send({ error: "Unknown template name" })
    }
    const html = await template(request.arguments)
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
    logger.info("sending email %o", command.input)
    await ses.send(command)
    return res.status(201).send()
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).send({ error: `Provided arguments don't match email input schema: ${err.message}` })
    }
    if (err instanceof InvalidTemplateArguments) {
      return res.status(400).send({
        error: `Arguments provided to template don't match the template's argument schema: ${err.message}`,
      })
    }
    logger.error("internal server error in AWS SES request: %o", err)
    return res.status(500).send()
  }
})

await server.listen({ port: 4433, host: "0.0.0.0" })
logger.info("started brevduen server on http://0.0.0.0:4433")
