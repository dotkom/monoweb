import { formatEmailSubject } from "@dotkomonline/utils"
import { z } from "zod"
import { procedure, t } from "../../trpc"
import { emails } from "../email/email-template"
import { createSpreadsheetRow } from "./spreadsheet"

const InterestFormSchema = z.object({
  companyName: z.string().min(3, "Bedriftsnavnet må ha minimum tre bokstaver"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.email("E-post adressen må være en gyldig e-post adresse"),
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

const submitInterestProcedure = procedure.input(InterestFormSchema).mutation(async ({ input, ctx }) => {
  const BEDKOM_EMAIL = "bedkom@online.ntnu.no"

  // Store the submission in Google Sheets.
  // NOTE: This could be replaced with a database table and dashboard in the future,
  // which would provide better querying, analytics, and integration with other systems.
  // Google Sheets is currently used for historical reasons and ease of access for bedkom.
  await createSpreadsheetRow(input, ctx.configuration)

  // Send notification email to bedkom with the submission details.
  // This allows bedkom to see and respond to interest submissions quickly.
  await ctx.emailService.send({
    fromEmailAddress: BEDKOM_EMAIL,
    replyTo: [input.contactEmail], // Reply-to company contact for easy response
    to: [BEDKOM_EMAIL],
    subject: formatEmailSubject(`[Interesse] ${input.companyName}`),
    definition: emails.COMPANY_COLLABORATION_NOTIFICATION,
    data: {
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
    },
  })

  // Send confirmation/receipt email to the company contact.
  // This provides them with a copy of their submission for their records.
  await ctx.emailService.send({
    fromEmailAddress: BEDKOM_EMAIL,
    replyTo: [BEDKOM_EMAIL], // Reply-to bedkom for follow-up questions
    to: [input.contactEmail],
    subject: formatEmailSubject("Takk for interessen!"),
    definition: emails.COMPANY_COLLABORATION_RECEIPT,
    data: {
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
    },
  })

  return { success: true }
})

export const rifRouter = t.router({
  submit: submitInterestProcedure,
})
