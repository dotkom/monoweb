import { z } from "zod"
import { SendEmailRequest } from "aws-sdk/clients/ses"

// TODO: Add fields for CC and BCC
export const mailSchema = z.object({
  sender: z.string().email(),
  recipient: z.string().email(),
  subject: z.string(),
  body: z.string(),
})

export const mapToSES = (data: MailSchema): SendEmailRequest => ({
  Source: data.sender,
  Destination: {
    ToAddresses: [data.recipient],
  },
  Message: {
    Subject: {
      Data: data.subject,
    },
    Body: {
      Text: {
        Data: data.body,
      },
    },
  },
})

export type MailSchema = z.infer<typeof mailSchema>
