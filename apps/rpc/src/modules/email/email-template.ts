import * as fsp from "node:fs/promises"
import * as path from "node:path"
import { z } from "zod"

export type EmailType = "COMPANY_COLLABORATION_RECEIPT"

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
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
} satisfies Record<string, EmailTemplate<any, any>>
