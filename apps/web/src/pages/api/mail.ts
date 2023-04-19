import { render } from "@react-email/render"
import { SES } from "@aws-sdk/client-ses"
import { HelloEmailTemplate, InvalidTemplateArguments, TemplateDescription } from "@dotkomonline/emails"
import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

const emailService = new SES({ apiVersion: "2010-12-01" })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTemplateById = (key: string): TemplateDescription<any> | null => {
  const templates = [HelloEmailTemplate]
  return templates.find((template) => template.key === key) ?? null
}

const inputSchema = z.object({
  template: z.string().min(1),
  source: z.string().email(),
  recipients: z.array(z.string().email()),
  subject: z.string().min(1),
  arguments: z.any(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" })
  }

  const result = inputSchema.safeParse(JSON.parse(req.body))
  if (!result.success) {
    return res.status(400).send({ error: "Invalid request schema" })
  }
  const { template, arguments: args, subject, recipients, source } = result.data
  const emailTemplate = getTemplateById(template)
  if (emailTemplate === null) {
    return res.status(400).send({ error: "Invalid template name" })
  }
  try {
    const jsx = emailTemplate.render(args)
    const html = render(jsx)

    await emailService.sendEmail({
      Source: source,
      Destination: {
        ToAddresses: recipients,
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
          Data: subject,
        },
      },
    })
  } catch (e: unknown) {
    if (e instanceof InvalidTemplateArguments) {
      return res.status(400).send({ error: "Invalid template arguments" })
    }
    return res.status(500).send({ error: "Internal server error" })
  }
  return res.status(201).send({ status: "Created" })
}
