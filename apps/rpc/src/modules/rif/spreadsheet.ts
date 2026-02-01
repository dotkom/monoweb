import { getLogger } from "@dotkomonline/logger"
import { google } from "googleapis"
import { z } from "zod"
import type { Configuration } from "../../configuration"

const logger = getLogger("rif-spreadsheet")

/**
 * Schema for validating Google service account JSON structure.
 * This is the standard format for Google Cloud service account credentials.
 */
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

/**
 * Interface matching the RIF form schema for type safety.
 */
interface InterestFormData {
  companyName: string
  contactName: string
  contactEmail: string
  contactTel: string
  requestsCompanyPresentation: boolean
  requestsCourseEvent: boolean
  requestsTwoInOneDeal: boolean
  requestsInstagramTakeover: boolean
  requestsExcursionParticipation: boolean
  requestsCollaborationEvent: boolean
  requestsFemalesInTechEvent: boolean
  comment: string
}

/**
 * Headers for the Google Sheets spreadsheet.
 * NOTE: If migrating to a database, these would become table columns.
 * Consider creating a dedicated "interest_submissions" table with proper
 * timestamps, status tracking, and foreign keys to companies if applicable.
 */
const SHEET_HEADERS = [
  "companyName",
  "contactName",
  "contactMail",
  "phone",
  "bedpres",
  "kurs",
  "pakkedeal",
  "instagram",
  "ekskursjonen",
  "samarbeid",
  "feminit",
  "comment",
]

/**
 * Store form submission data in Google Sheets.
 *
 * NOTE: This Google Sheets integration could be replaced with database storage
 * in the future. Benefits of database storage would include:
 * - Better querying and filtering capabilities
 * - Integration with an admin dashboard for bedkom
 * - Analytics and reporting features
 * - Reduced dependency on external services
 * - Better audit trails and data integrity
 *
 * The current Google Sheets approach is maintained for:
 * - Ease of access for bedkom members without technical skills
 * - Quick setup without database migrations
 * - Familiar interface for non-technical users
 * - Historical continuity with existing workflows
 */
export const createSpreadsheetRow = async (form: InterestFormData, configuration: Configuration) => {
  // Check if Google Sheets integration is configured
  if (!configuration.rif?.serviceAccount || !configuration.rif?.spreadsheetId) {
    logger.warn(
      "Google Sheets integration is not configured (missing RIF_SERVICE_ACCOUNT or RIF_SPREADSHEET_ID). Skipping spreadsheet row creation."
    )
    return
  }

  // Parse and validate service account credentials
  const json = JSON.parse(atob(configuration.rif.serviceAccount))
  const result = serviceAccountSchema.safeParse(json)
  if (!result.success) {
    throw new Error("Invalid service account credentials for Google Sheets integration")
  }

  const auth = new google.auth.JWT({
    email: result.data.client_email,
    key: result.data.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })

  // Convert form data to spreadsheet row format.
  // NOTE: The phone number format conversion (+47 -> 0047) is for legacy
  // compatibility with existing spreadsheet processing.
  const rowValues = [
    form.companyName,
    form.contactName,
    form.contactEmail,
    form.contactTel.replace("+", "00"),
    form.requestsCompanyPresentation.toString(),
    form.requestsCourseEvent.toString(),
    form.requestsTwoInOneDeal.toString(),
    form.requestsInstagramTakeover.toString(),
    form.requestsExcursionParticipation.toString(),
    form.requestsCollaborationEvent.toString(),
    form.requestsFemalesInTechEvent.toString(),
    form.comment,
  ]

  // First, ensure headers exist (check if row 1 has headers)
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: configuration.rif.spreadsheetId,
    range: "A1:L1",
  })

  // If no headers exist, add them first
  if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: configuration.rif.spreadsheetId,
      range: "A1:L1",
      valueInputOption: "RAW",
      requestBody: {
        values: [SHEET_HEADERS],
      },
    })
  }

  // Append the new row
  await sheets.spreadsheets.values.append({
    spreadsheetId: configuration.rif.spreadsheetId,
    range: "A:L",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rowValues],
    },
  })

  logger.info("Successfully added interest form submission to Google Sheets for company: %s", form.companyName)
}
