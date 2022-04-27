import { z } from "zod"

// TODO: Add fields for CC and BCC
export const mailSchema = z.object({
  sender: z.string().email(),
  recipient: z.string().email(),
  subject: z.string(),
  body: z.string(),
})

export type Mail = z.infer<typeof mailSchema>
