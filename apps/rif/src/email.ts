import type { FormSchema } from "./app/form-schema"

const endpoint = process.env.EMAIL_ENDPOINT ?? "https://brevduen.staging.online.ntnu.no/integrations/email"
const token = process.env.EMAIL_TOKEN ?? "__NO_TOKEN_PROVIDED__"

export const deliverConfirmationEmail = async (form: FormSchema) => {
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
      subject: `[Interesse] ${form.companyName}`,
      replyTo: [form.contactEmail],
      arguments: {
        ...form,
      },
    }),
  })
  console.info(`Sent request to email endpoint, received ${response.status}`);
  return response
}

export const deliverNotificationEmail = async (form: FormSchema) => {
  const response = await fetch(endpoint, {
    headers: {
      "X-Email-Token": token,
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
  console.info(`Sent confirmation to email endpoint, received ${response.status}`);
  return response
}
