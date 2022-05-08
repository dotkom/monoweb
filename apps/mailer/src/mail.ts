import { z } from "zod"
import { templates, TemplateMap } from "./template-service"

// non empty array with the possible template strings
type AllowedTemplates = [keyof TemplateMap] & (keyof TemplateMap)[]

export const mailSchema = z.object({
  sender: z.string().email(),
  recipients: z.array(z.string().email()).nonempty(),
  carbonCopy: z.array(z.string().email()),
  blindCarbonCopy: z.array(z.string().email()),
  subject: z.string(),
  body: z.string(),
  template: z.enum(Object.keys(templates) as AllowedTemplates).default("base"),
})

export type MailSchema = z.infer<typeof mailSchema>
