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

const templates = path.resolve(import.meta.url, "../../resources/email")

export const emails = {
  COMPANY_COLLABORATION_RECEIPT: createEmailTemplate({
    type: "COMPANY_COLLABORATION_RECEIPT",
    getSchema: () => z.object({}),
    getTemplate: async () => fsp.readFile(path.join(templates, "company-collaboration-receipt.mustache"), "utf-8"),
  }),
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
} satisfies Record<string, EmailTemplate<any, any>>
