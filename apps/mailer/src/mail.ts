import { z } from "zod"

export const mailSchema = z.object({
  sender: z.string().email(),
  recipients: z.array(z.string().email()).nonempty(),
  carbonCopy: z.array(z.string().email()),
  blindCarbonCopy: z.array(z.string().email()),
  subject: z.string(),
  body: z.string(),
})

export type MailSchema = z.infer<typeof mailSchema>
