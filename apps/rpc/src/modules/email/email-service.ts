import type { SESClient } from "@aws-sdk/client-ses"
import { type SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { getLogger } from "@dotkomonline/logger"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import z from "zod"
import type { Configuration } from "../../configuration"
import { InvalidArgumentError } from "../../error"
import type { EmailTemplate, EmailType, InferEmailData } from "./email-template"

const EmailMessageSchema = z.object({
  source: z.string().email(),
  replyTo: z.string().email().array(),
  to: z.string().email().array(),
  cc: z.string().email().array(),
  bcc: z.string().email().array(),
  subject: z.string(),
  type: z.custom<EmailType>(),
  data: z.any(),
})

export interface EmailService {
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
  send<TDef extends EmailTemplate<any, any>>(
    source: string,
    replyTo: string[],
    to: string[],
    cc: string[],
    bcc: string[],
    subject: string,
    definition: TDef,
    data: InferEmailData<TDef>
  ): Promise<void>
}

export function getEmailService(
  sesClient: SESClient,
  sqsClient: SQSClient,
  configuration: Configuration
): EmailService {
  const logger = getLogger("email-service")
  const tracer = trace.getTracer("@dotkomonline/monoweb-rpc/email-service")
  return {
    async send(source, replyTo, to, cc, bcc, subject, definition, data) {
      return await tracer.startActiveSpan("EmailService#send", async (span) => {
        try {
          logger.info(
            "Posting Email(From=%s, ReplyTo=%o, To=%o, Cc=%o, Bcc=%o, Subject=%s, TemplateType=%s) to SQS Queue",
            source,
            replyTo,
            to,
            cc,
            bcc,
            subject,
            definition.type
          )
          const result = definition.getSchema().safeParse(data)
          if (!result.success) {
            span.recordException(result.error)
            span.setStatus({ code: SpanStatusCode.ERROR })
            // NOTE: Recipients are interpolated using %o as they are an array. We also purposefully do NOT put the data
            // or the Zod error message into the error to avoid leaking potentially sensitive information to the client.
            logger.error("Failed to send email to %o due to invalid template data: %o", to, result.error)
            throw new InvalidArgumentError("Could not send email due to invalid template data.")
          }

          const template = await definition.getTemplate()
          // NOTE: These are not SEMCONV attributes. See https://opentelemetry.io/blog/2025/how-to-name-your-span-attributes/
          span.addEvent("@aws-sdk/client-ses#SendEmailCommand", {
            "email.source": source,
            "email.replyTo": replyTo,
            "email.to": to,
            "email.cc": cc,
            "email.bcc": bcc,
            "email.subject": subject,
          })

          if (configuration.AWS_SQS_QUEUE_EMAIL_DELIVERY === null) {
            logger.warn("Cancelling posting of email due to disabled or missing AWS SQS email-delivery queue")
            return
          }

          const cmd = new SendMessageCommand({
            QueueUrl: configuration.AWS_SQS_QUEUE_EMAIL_DELIVERY,
            MessageBody: JSON.stringify(
              EmailMessageSchema.parse({
                source,
                replyTo,
                to,
                cc,
                bcc,
                subject,
                type: definition.type,
                data: result.data,
              } satisfies z.infer<typeof EmailMessageSchema>)
            ),
          })
          const response = await sqsClient.send(cmd)
          logger.info(
            "Posted Message(ID=%s) to AWS SQS Queue %s",
            response.MessageId ?? "<unknown>",
            configuration.AWS_SQS_QUEUE_EMAIL_DELIVERY
          )
        } finally {
          span.end()
        }
      })
    },
  }
}
