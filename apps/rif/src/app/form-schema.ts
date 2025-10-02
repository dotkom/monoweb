import { z } from "zod"

export const formSchema = z.object({
  companyName: z.string().min(3, "Bedriftsnavnet må ha minimum tre bokstaver"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean().prefault(false),
  requestsCourseEvent: z.boolean().prefault(false),
  requestsTwoInOneDeal: z.boolean().prefault(false),
  requestsInstagramTakeover: z.boolean().prefault(false),
  requestsExcursionParticipation: z.boolean().prefault(false),
  requestsCollaborationEvent: z.boolean().prefault(false),
  requestsFemalesInTechEvent: z.boolean().prefault(false),
  comment: z.string().prefault("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
