import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { procedure, t } from "../../trpc"
import { emails } from "../email/email-template"

const InvoiceRelation = {
  COMPANY_PRESENTATION: "Bedriftspresentasjon",
  COURSE_EVENT: "Kurs",
  OFFLINE_ADVERTISEMENT: "Annonse i Offline",
  JOB_LISTING: "Jobbannonse",
  EXCURSION_PARTICIPATION: "ITEX",
  OTHER: "Annet",
} as const

const DeliveryMethod = {
  EMAIL: "E-post",
  POST: "Post",
  EHF: "EHF",
} as const

const InvoiceFormSchema = z.object({
  companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
  organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
  invoiceRelation: z.nativeEnum(InvoiceRelation),
  preferredDeliveryMethod: z.nativeEnum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.coerce.number().nullish().default(null),
  preferredDueDateLength: z.coerce.number().int().min(1).max(90).default(14),
  comment: z.string().default("Ingen kommentar"),
})

export type SubmitInvoiceInput = inferProcedureInput<typeof submitInvoiceProcedure>
export type SubmitInvoiceOutput = inferProcedureOutput<typeof submitInvoiceProcedure>

const submitInvoiceProcedure = procedure.input(InvoiceFormSchema).mutation(async ({ input, ctx }) => {
  const BEDKOM_EMAIL = "bedkom@online.ntnu.no"

  await ctx.emailService.send(
    BEDKOM_EMAIL,
    [BEDKOM_EMAIL],
    [BEDKOM_EMAIL],
    [],
    [],
    `[Faktura] ${input.companyName}`,
    emails.COMPANY_INVOICE_NOTIFICATION,
    {
      companyName: input.companyName,
      organizationNumber: input.organizationNumber,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactTel: input.contactTel,
      invoiceRelation: input.invoiceRelation,
      preferredDeliveryMethod: input.preferredDeliveryMethod,
      preferredPurchaseOrderNumber: input.preferredPurchaseOrderNumber ?? null,
      preferredDueDateLength: input.preferredDueDateLength,
      comment: input.comment ?? null,
    }
  )

  return { success: true }
})

export const invoicificationRouter = t.router({
  submit: submitInvoiceProcedure,
})
