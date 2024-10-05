import { JWT } from "google-auth-library"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { z } from "zod"
import type { FormSchema } from "./app/form-schema"
import { env } from "./env"

const serviceAccountSchema = z.object({
  type: z.literal("service_account"),
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string(),
  client_id: z.string(),
  auth_uri: z.string(),
  token_uri: z.string(),
  auth_provider_x509_cert_url: z.string(),
  client_x509_cert_url: z.string(),
})

const authenticate = (): JWT => {
  const json = JSON.parse(atob(env.SERVICE_ACCOUNT))
  const result = serviceAccountSchema.safeParse(json)
  if (!result.success) {
    throw new Error("Invalid service account")
  }
  const scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"]
  return new JWT({
    email: result.data.client_email,
    key: result.data.private_key,
    scopes,
  })
}

export const createSpreadsheetRow = async (form: FormSchema) => {
  const jwt = authenticate()
  const spreadsheet = new GoogleSpreadsheet(env.SPREADSHEET_ID, jwt)
  await spreadsheet.loadInfo()

  const sheet = spreadsheet.sheetsByIndex.at(0)
  if (sheet === undefined) {
    throw new Error("The spreadsheet does not contain any sheets")
  }
  await sheet.setHeaderRow([
    "companyName",
    "contactName",
    "contactMail",
    "phone",
    "bedpres",
    "kurs",
    "instagram",
    "ekskursjonen",
    "samarbeid",
    "feminit",
    "comment",
  ])

  const plainRowContent = {
    companyName: form.companyName,
    contactName: form.contactName,
    contactMail: form.contactEmail,
    phone: form.contactTel.replace("+", "00"),
    bedpres: form.requestsCompanyPresentation,
    kurs: form.requestsCourseEvent,
    instagram: form.requestsInstagramTakeover,
    ekskursjonen: form.requestsExcursionParticipation,
    samarbeid: form.requestsCollaborationEvent,
    feminit: form.requestsFemalesInTechEvent,
    comment: form.comment,
  }
  await sheet.addRow(plainRowContent, {
    insert: true,
  })
}
