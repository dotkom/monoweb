import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { procedure, t } from "../../trpc"
import { emails } from "../email/email-template"
import { createSpreadsheetRow } from "./spreadsheet"

const InterestFormSchema = z.object({
  companyName: z.string().min(3, "Bedriftsnavnet må ha minimum tre bokstaver"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean().default(false),
  requestsCourseEvent: z.boolean().default(false),
  requestsTwoInOneDeal: z.boolean().default(false),
  requestsInstagramTakeover: z.boolean().default(false),
  requestsExcursionParticipation: z.boolean().default(false),
  requestsCollaborationEvent: z.boolean().default(false),
  requestsFemalesInTechEvent: z.boolean().default(false),
  comment: z.string().default("Ingen kommentar"),
})

export type SubmitInterestInput = inferProcedureInput<typeof submitInterestProcedure>
export type SubmitInterestOutput = inferProcedureOutput<typeof submitInterestProcedure>

const submitInterestProcedure = procedure.input(InterestFormSchema).mutation(async ({ input, ctx }) => {
  const BEDKOM_EMAIL = "bedkom@online.ntnu.no"

  // Store the submission in Google Sheets.
  // NOTE: This could be replaced with a database table and dashboard in the future,
  // which would provide better querying, analytics, and integration with other systems.
  // Google Sheets is currently used for historical reasons and ease of access for bedkom.
  await createSpreadsheetRow(input, ctx.configuration)

  // Send notification email to bedkom with the submission details.
  // This allows bedkom to see and respond to interest submissions quickly.
  await ctx.emailService.send(
    BEDKOM_EMAIL,
    [input.contactEmail], // Reply-to company contact for easy response
    [BEDKOM_EMAIL],
    [],
    [],
    `[Interesse] ${input.companyName}`,
    emails.COMPANY_COLLABORATION_NOTIFICATION,
    {
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactTel: input.contactTel,
      requestsCompanyPresentation: input.requestsCompanyPresentation,
      requestsCourseEvent: input.requestsCourseEvent,
      requestsTwoInOneDeal: input.requestsTwoInOneDeal,
      requestsInstagramTakeover: input.requestsInstagramTakeover,
      requestsExcursionParticipation: input.requestsExcursionParticipation,
      requestsCollaborationEvent: input.requestsCollaborationEvent,
      requestsFemalesInTechEvent: input.requestsFemalesInTechEvent,
      comment: input.comment,
    }
  )

  // Send confirmation/receipt email to the company contact.
  // This provides them with a copy of their submission for their records.
  await ctx.emailService.send(
    BEDKOM_EMAIL,
    [BEDKOM_EMAIL], // Reply-to bedkom for follow-up questions
    [input.contactEmail],
    [],
    [],
    "Kvittering for meldt interesse til Online",
    emails.COMPANY_COLLABORATION_RECEIPT,
    {
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactTel: input.contactTel,
      requestsCompanyPresentation: input.requestsCompanyPresentation,
      requestsCourseEvent: input.requestsCourseEvent,
      requestsTwoInOneDeal: input.requestsTwoInOneDeal,
      requestsInstagramTakeover: input.requestsInstagramTakeover,
      requestsExcursionParticipation: input.requestsExcursionParticipation,
      requestsCollaborationEvent: input.requestsCollaborationEvent,
      requestsFemalesInTechEvent: input.requestsFemalesInTechEvent,
      comment: input.comment,
    }
  )

  return { success: true }
})

export const rifRouter = t.router({
  submit: submitInterestProcedure,
})
