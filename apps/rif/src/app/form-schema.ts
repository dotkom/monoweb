import { z } from "zod"

export const formSchema = z.object({
  companyName: z.string().min(3, "Bedriftsnavnet må ha minimum tre bokstaver"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean().default(false),
  requestsCourseEvent: z.boolean().default(false),
  requestsInstagramTakeover: z.boolean().default(false),
  // requestsTechTalksParticipation: z.boolean().default(false),
  requestsExcursionParticipation: z.boolean().default(false),
  requestsCollaborationEvent: z.boolean().default(false),
  requestsFemalesInTechEvent: z.boolean().default(false),
  comment: z.string().default("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
