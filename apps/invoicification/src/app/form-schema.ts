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
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
  invoiceRelation: z.nativeEnum(InvoiceRelation),
  preferredDeliveryMethod: z.nativeEnum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.coerce.number().nullish().default(null),
  preferredDueDateLength: z.coerce.number().int().min(1).max(90).default(14),
  comment: z.string().default("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
