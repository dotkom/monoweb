import * as fsp from "node:fs/promises"
import * as path from "node:path"
import { z } from "zod"

export type EmailType =
  | "COMPANY_COLLABORATION_RECEIPT"
  | "COMPANY_COLLABORATION_NOTIFICATION"
  | "COMPANY_INVOICE_NOTIFICATION"

export interface EmailTemplate<TData, TType extends EmailType> {
  getSchema(): z.ZodSchema<TData>
  getTemplate(): Promise<string>
  type: TType
}

export type InferEmailData<TDef> = TDef extends EmailTemplate<infer TData, infer TType> ? TData : never
export type InferEmailType<TDef> = TDef extends EmailTemplate<infer TData, infer TType extends EmailType>
  ? TType
  : never

export type CompanyCollaborationReceiptEmailTemplate = typeof emails.COMPANY_COLLABORATION_RECEIPT
export type CompanyCollaborationNotificationEmailTemplate = typeof emails.COMPANY_COLLABORATION_NOTIFICATION
export type CompanyInvoiceNotificationEmailTemplate = typeof emails.COMPANY_INVOICE_NOTIFICATION
export type AnyEmailTemplate = CompanyCollaborationReceiptEmailTemplate

export function createEmailTemplate<const TData, const TType extends EmailType>(
  definition: EmailTemplate<TData, TType>
): EmailTemplate<TData, TType> {
  return definition
}

const templates = path.resolve(new URL("../../../resources/email", import.meta.url).pathname)

export const emails = {
  COMPANY_COLLABORATION_RECEIPT: createEmailTemplate({
    type: "COMPANY_COLLABORATION_RECEIPT",
    getSchema: () =>
      z.object({
        companyName: z.string().min(1).max(140),
        contactName: z.string().min(1),
        contactEmail: z.string().email(),
        contactTel: z.string(),
        requestsCompanyPresentation: z.boolean(),
        requestsCourseEvent: z.boolean(),
        requestsTwoInOneDeal: z.boolean(),
        requestsInstagramTakeover: z.boolean(),
        requestsExcursionParticipation: z.boolean(),
        requestsCollaborationEvent: z.boolean(),
        requestsFemalesInTechEvent: z.boolean(),
        comment: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_collaboration_receipt.mustache"), "utf-8"),
  }),
  COMPANY_COLLABORATION_NOTIFICATION: createEmailTemplate({
    type: "COMPANY_COLLABORATION_NOTIFICATION",
    getSchema: () =>
      z.object({
        companyName: z.string().min(1).max(140),
        contactName: z.string().min(1),
        contactEmail: z.string().email(),
        contactTel: z.string(),
        requestsCompanyPresentation: z.boolean(),
        requestsCourseEvent: z.boolean(),
        requestsTwoInOneDeal: z.boolean(),
        requestsInstagramTakeover: z.boolean(),
        requestsExcursionParticipation: z.boolean(),
        requestsCollaborationEvent: z.boolean(),
        requestsFemalesInTechEvent: z.boolean(),
        comment: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_collaboration_notification.mustache"), "utf-8"),
  }),
  COMPANY_INVOICE_NOTIFICATION: createEmailTemplate({
    type: "COMPANY_INVOICE_NOTIFICATION",
    getSchema: () =>
      z.object({
        companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
        organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
        contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
        contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
        contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
        invoiceRelation: z.enum(["E-post", "Post", "EHF"]),
        preferredPurchaseOrderNumber: z.number().nullable(),
        preferredDueDateLength: z.number(),
        comment: z.string().nullable(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_invoice_notification.mustache"), "utf-8"),
  }),
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
} satisfies Record<string, EmailTemplate<any, any>>
