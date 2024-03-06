import { z } from "zod"

export enum InvoiceRelation {
  COMPANY_PRESENTATION = "company_presentation",
  COURSE_EVENT = "course_event",
  OFFLINE_ADVERTISEMENT = "offline_advertisement",
  JOB_LISTING = "job_listing",
  TECH_TALKS_PARTICIPATION = "tech_talks_participation",
  EXCURSION_PARTICIPATION = "excursion_participation",
  OTHER = "other",
}

export enum DeliveryMethod {
  EMAIL = "email",
  POST = "post",
  EHF = "ehf",
}

export const formSchema = z.object({
  companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
  organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string(),
  invoiceRelation: z.nativeEnum(InvoiceRelation),
  preferredDeliveryMethod: z.nativeEnum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.string().nullish().default(null),
  preferredDueDateLength: z.number().int().min(1).max(90).default(14),
  comment: z.string().default("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
