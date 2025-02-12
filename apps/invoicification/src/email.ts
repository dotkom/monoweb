import type { FormSchema } from "./app/form-schema"
import { env } from "./env"

export const deliverNotificationEmail = async (form: FormSchema) => {
  const response = await fetch(env.EMAIL_ENDPOINT, {
    headers: {
      "X-Email-Token": env.EMAIL_TOKEN,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      template: "invoice-form-for-bedkom",
      source: "bedkom@online.ntnu.no",
      to: ["bedkom@online.ntnu.no"],
      cc: [],
      bcc: [],
      subject: `[Faktura] ${form.companyName}`,
      replyTo: ["bedkom@online.ntnu.no"],
      arguments: {
        ...form,
      },
    }),
  })
  console.info(`Sent notification to email endpoint, received ${response.status}`)
  return response
}
