import type { FormSchema } from "./app/form-schema"

const endpoint = process.env.EMAIL_ENDPOINT ?? "https://brevduen.staging.online.ntnu.no/integrations/email"
const token = process.env.EMAIL_TOKEN ?? "__NO_TOKEN_PROVIDED__"

export const deliverNotificationEmail = async (form: FormSchema) => {
  const response = await fetch(endpoint, {
    headers: {
      "X-Email-Token": token,
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
  console.info(`Sent notification to email endpoint, received ${response.status} (${await response.text()})`)
  return response
}
