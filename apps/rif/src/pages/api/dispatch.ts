import { NextApiRequest, NextApiResponse } from "next"

import { formSchema } from "../../app/form-schema"

const endpoint = process.env.EMAIL_ENDPOINT ?? "https://dev.gateway.online.ntnu.no/integrations/email"
const token = process.env.EMAIL_TOKEN ?? "__NO_TOKEN_PROVIDED__"

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405)
  }
  const json = JSON.parse(req.body)
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    return res.status(400)
  }
  const body = parseResult.data

  const response = await fetch(endpoint, {
    headers: {
      "X-Email-Token": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      template: "interest-form-for-bedkom",
      source: "bedkom@online.ntnu.no",
      to: ["bedkom@online.ntnu.no"],
      cc: [],
      bcc: [],
      subject: `[Interesse] ${body.companyName}`,
      replyTo: [body.contactEmail],
      arguments: {
        ...body,
      },
    }),
  })
  console.info(`Sent request to email endpoint, received ${response.status} (${await response.text()})`)
  const confirmationResponse = await fetch(endpoint, {
    headers: {
      "X-Email-Token": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      template: "interest-form-for-company",
      source: "bedkom@online.ntnu.no",
      to: [body.contactEmail],
      cc: [],
      bcc: [],
      subject: `Kvittering for meldt interesse til Online`,
      replyTo: ["bedkom@online.ntnu.no"],
      arguments: {
        ...body,
      },
    }),
  })
  console.info(
    `Sent confirmation to email endpoint, received ${
      confirmationResponse.status
    } (${await confirmationResponse.text()})`
  )
  res.status(response.status).json({})
}
