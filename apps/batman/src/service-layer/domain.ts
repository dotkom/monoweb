import { z } from "zod"

export const TransactionSchema = z.object({
  orderNumber: z.string(),
  name: z.string(),
  email: z.string().email(),
  amount: z.number(),
  datetime: z.date(),
  transactionDescription: z.string(),
  invoiceNumber: z.string(),
  historyId: z.string(),
  emailId: z.string(),
})

export const EmailSchema = z.object({
  date: z.date(),
  receiver: z.string(),
  sender: z.string(),
  subject: z.string(),
  body: z.string(),
  historyId: z.string(),
  emailId: z.string(),
})

// TypeScript types inferred from Zod schemas
export type Transaction = z.infer<typeof TransactionSchema>
export type Email = z.infer<typeof EmailSchema>
