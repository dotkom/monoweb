import { gmail_v1 } from "googleapis"
import { Email, EmailSchema } from "./domain"
import { z } from "zod"
import { Buffer } from "buffer"
import { env } from "./env"

export interface GmailService {
  getHistory(startId: string, labelIdFilter?: string): Promise<Email[]>
  getNewestEmails(maxResults: number, labelIdFilter?: string[]): Promise<Email[]>
  getEmail(messageId: string): Promise<Email>
  watch(): Promise<void>
}

const EmailWithBase64Body = z
  .object({
    historyId: z.string(),
    id: z.string(),
    internalDate: z.string(),
    labelIds: z.array(z.string()),
    payload: z.object({
      body: z.object({
        data: z.string().optional(),
      }),
      parts: z
        .array(
          z.object({
            body: z.object({
              data: z.string(),
              size: z.number(),
            }),
          })
        )
        .optional(),
      headers: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      ),
    }),
  })
  .transform((msg) => {
    const hasTo = msg.payload.headers.find((header) => header.name === "To")
    const hasFrom = msg.payload.headers.find((header) => header.name === "From")
    const hasSubject = msg.payload.headers.find((header) => header.name === "Subject")
    if (!hasTo || !hasFrom || !hasSubject) {
      throw new Error("Email is missing required headers")
    }

    let body = ""

    if (msg.payload.body.data) {
      body = Buffer.from(msg.payload.body.data, "base64url").toString("utf-8")
    } else if (msg.payload.parts) {
      body = msg.payload.parts.map((part) => Buffer.from(part.body.data, "base64url").toString("utf-8")).join("\n")
    } else {
      throw new Error("Email is missing body")
    }

    return {
      ...msg,
      receiver: hasTo.value,
      sender: hasFrom.value,
      subject: hasSubject.value,
      body,
    }
  })

type EmailWithBase64Body = z.infer<typeof EmailWithBase64Body>

const ListMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
})

type ListMessageSchema = z.infer<typeof ListMessageSchema>

export class GmailServiceImpl implements GmailService {
  constructor(private readonly gmail: gmail_v1.Gmail) {}

  async watch(): Promise<void> {
    const resp = await this.gmail.users.watch({
      userId: "me",
      requestBody: {
        labelIds: [env.GMAIL_LABEL_ID],
        topicName: `projects/${env.TF_VAR_GCLOUD_PROJECT_ID}/topics/${env.TF_VAR_GCLOUD_PUBSUB_TOPIC_NAME}`,
      },
    })

    console.log("Created new watch subscription", JSON.stringify(resp.data, null, 2))
  }

  async getHistory(startId: string, labelIdFilter?: string): Promise<Email[]> {
    const resp = await this.gmail.users.history.list({
      userId: "me",
      startHistoryId: startId,
      historyTypes: ["messageAdded"],
      labelId: labelIdFilter,
    })

    console.dir(resp.data, { depth: null })

    const messagesAdded: ListMessageSchema[] = []

    for (const history of resp.data.history || []) {
      for (const message of history.messagesAdded || []) {
        const parsed = ListMessageSchema.safeParse(message.message)

        if (!parsed.success) {
          console.error(`Failed to parse message: ${parsed.error}`)
          continue
        }

        messagesAdded.push(parsed.data)
      }
    }

    const emails: Email[] = []

    for (const msg of messagesAdded) {
      try {
        const email = await this.getEmail(msg.id)
        emails.push(email)
      } catch (e) {
        console.error(`Failed to get email ${msg.id}: ${e}`)
      }
    }

    return emails
  }

  async getNewestEmails(maxResults: number, labelIdFilter?: string[]): Promise<Email[]> {
    let pageToken: string | undefined

    const emails: Email[] = []

    do {
      // this fetches the newest emails first, then goes backwards. Thus we can break the loop when we have enough emails, as we only need the newest ones
      const resp = await this.gmail.users.messages.list({
        includeSpamTrash: false,
        labelIds: labelIdFilter,
        maxResults,
        pageToken: pageToken,
        userId: "me",
      })

      const respMessages = (resp.data.messages || []).map((msg) => ListMessageSchema.parse(msg))

      for (const msg of respMessages) {
        try {
          const email = await this.getEmail(msg.id)
          emails.push(email)
        } catch (e) {
          console.error(`Failed to get email ${msg.id}: ${e}`)
        }

        if (emails.length >= maxResults) {
          return emails
        }
      }

      if (!resp.data.nextPageToken) {
        pageToken = undefined
      } else {
        pageToken = resp.data.nextPageToken
      }
    } while (pageToken)

    return emails
  }

  async getEmail(id: string): Promise<Email> {
    const detailed = await this.gmail.users.messages.get({
      id,
      userId: "me",
      format: "full",
    })

    return this.mapToEmail(detailed.data)
  }

  mapToEmail(_msg: gmail_v1.Schema$Message): Email {
    const parsed = EmailWithBase64Body.safeParse(_msg)

    if (!parsed.success) {
      console.dir(_msg, { depth: null })
      throw new Error(`Failed to parse email body: ${parsed.error}`)
    }

    const msg = parsed.data

    const raw = {
      body: msg.body,
      email_id: msg.id,
      history_id: msg.historyId,
      date: new Date(Number(msg.internalDate)),
      emailId: msg.id,
      historyId: msg.historyId,
      receiver: msg.receiver,
      sender: msg.sender,
      subject: msg.subject,
    }

    return EmailSchema.parse(raw)
  }
}
