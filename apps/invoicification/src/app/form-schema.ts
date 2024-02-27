import { z } from "zod"

export enum InvoiceRelation {
  COMPANY_PRESENTATION = "Bedriftspresentasjon",
  COURSE_EVENT = "Kurs",
  OFFLINE_ADVERTISEMENT = "Annonse i Offline",
  JOB_LISTING = "Jobbannonse",
  TECH_TALKS_PARTICIPATION = "Tech Talks",
  EXCURSION_PARTICIPATION = "ITEX",
  OTHER = "Annet",
}

export enum DeliveryMethod {
  EMAIL = "E-post",
  POST = "Post",
  EHF = "EHF",
}

export const formSchema = z.object({
  companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
  organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string(),
  invoiceRelation: z.nativeEnum(InvoiceRelation),
  preferredDeliveryMethod: z.nativeEnum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.coerce.number().nullish().default(null),
  preferredDueDateLength: z.number().int().min(1).max(90).default(14),
  comment: z.string().default("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
