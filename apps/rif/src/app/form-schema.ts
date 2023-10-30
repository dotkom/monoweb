import { z } from "zod"

export const formSchema = z.object({
  companyName: z.string().min(1).max(140),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean().default(false),
  requestsCourseEvent: z.boolean().default(false),
  requestsJobListing: z.boolean().default(false),
  requestsInstagramTakeover: z.boolean().default(false),
  requestsTechTalksParticipation: z.boolean().default(false),
  requestsExcursionParticipation: z.boolean().default(false),
  comment: z.string().default("Ingen kommentar"),
})

export type FormSchema = z.infer<typeof formSchema>
