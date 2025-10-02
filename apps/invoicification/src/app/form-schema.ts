import { z } from "zod"

export const InvoiceRelation = {
  COMPANY_PRESENTATION: "Bedriftspresentasjon",
  COURSE_EVENT: "Kurs",
  OFFLINE_ADVERTISEMENT: "Annonse i Offline",
  JOB_LISTING: "Jobbannonse",
  EXCURSION_PARTICIPATION: "ITEX",
  OTHER: "Annet",
} as const

export const DeliveryMethod = {
  EMAIL: "E-post",
  POST: "Post",
  EHF: "EHF",
} as const

export const formSchema = z.object({
  companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
  organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
  invoiceRelation: z.enum(InvoiceRelation),
  preferredDeliveryMethod: z.enum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.coerce.number().nullish().prefault(null),
  preferredDueDateLength: z.coerce.number().int().min(1).max(90).prefault(14),
  comment: z.string().prefault("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
