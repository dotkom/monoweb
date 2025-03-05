import type { FormSchema } from "./app/form-schema"
import { env } from "./env"

export const deliverConfirmationEmail = async (form: FormSchema) => {
  const response = await fetch(env.EMAIL_ENDPOINT, {
    headers: {
      "X-Email-Token": env.EMAIL_TOKEN,
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
      subject: `[Interesse] ${form.companyName}`,
      replyTo: [form.contactEmail],
      arguments: {
        ...form,
      },
    }),
  })
  console.info(`Sent request to email endpoint, received ${response.status}`)
  return response
}

export const deliverNotificationEmail = async (form: FormSchema) => {
  const response = await fetch(env.EMAIL_ENDPOINT, {
    headers: {
      "X-Email-Token": env.EMAIL_TOKEN,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      template: "interest-form-for-company",
      source: "bedkom@online.ntnu.no",
      to: [form.contactEmail],
      cc: [],
      bcc: [],
      subject: "Kvittering for meldt interesse til Online",
      replyTo: ["bedkom@online.ntnu.no"],
      arguments: {
        ...form,
      },
    }),
  })
  console.info(`Sent confirmation to email endpoint, received ${response.status}`)
  return response
}
