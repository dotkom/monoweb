import { SendEmailCommand } from "@aws-sdk/client-ses"
import type { SESClient } from "@aws-sdk/client-ses"
import { DeleteMessageCommand, type Message, ReceiveMessageCommand } from "@aws-sdk/client-sqs"
import { type SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { getLogger } from "@dotkomonline/logger"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import mustache from "mustache"
import z from "zod"
import type { ConfigurationWithAmazonSesEmail } from "../../configuration"
import { IllegalStateError } from "../../error"
import { InvalidArgumentError } from "../../error"
import { emails } from "./email-template"
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
  /**
   * Start the SQS Consumer for actually submitting emails to SES.
   *
   * NOTE: This function does not need a stop function, it can simply listen to a provided signal.
   */
  startWorker(signal: AbortSignal): void
}

export function getEmptyEmailService(): EmailService {
  const logger = getLogger("EmptyEmailService")
  return {
    async send(source, replyTo, to, cc, bcc, subject, definition, _) {
      logger.warn(
        "Discarding Email(From=%s, ReplyTo=%o, To=%o, Cc=%o, Bcc=%o, Subject=%s, TemplateType=%s) because EmptyEmailService is being used",
        source,
        replyTo,
        to,
        cc,
        bcc,
        subject,
        definition.type
      )
    },
    startWorker(_) {
      logger.warn("EmailService#startWorker() called on EmptyEmailService")
    },
  }
}

export function getEmailService(
  sesClient: SESClient,
  sqsClient: SQSClient,
  configuration: ConfigurationWithAmazonSesEmail
): EmailService {
  const logger = getLogger("email-service")
  const tracer = trace.getTracer("@dotkomonline/monoweb-rpc/email-service")

  async function processSqsMessage(message: Message): Promise<void> {
    return await tracer.startActiveSpan("EmailService/SendEmail", async (span) => {
      try {
        if (message.Body === undefined) {
          throw new IllegalStateError(
            `Received Message(ID=${message.MessageId ?? "<missing id>"}) with empty SQS MessageBody`
          )
        }

        const payload = EmailMessageSchema.safeParse(JSON.parse(message.Body))
        if (!payload.success) {
          logger.error(
            "Failed to parse email payload for Message(ID=%s): %o with data payload %o",
            message.MessageId ?? "<missing id>",
            payload.error.message,
            message.Body
          )
          throw new IllegalStateError(
            `Failed to parse email payload for Message(ID=${message.MessageId ?? "<missing id>"})`
          )
        }

        const emailTemplate = emails[payload.data.type]
        if (emailTemplate === undefined) {
          throw new IllegalStateError(`Failed to find email template for Type=${payload.data.type}`)
        }

        const template = await emailTemplate.getTemplate()

        const html = mustache.render(template, payload.data.data)
        const sendEmailCommand = new SendEmailCommand({
          Source: payload.data.source,
          ReplyToAddresses: payload.data.replyTo,
          Destination: {
            ToAddresses: payload.data.to,
            CcAddresses: payload.data.cc,
            BccAddresses: payload.data.bcc,
          },
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: html,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: payload.data.subject,
            },
          },
        })
        logger.info(
          "Sending Email(From=%s, ReplyTo=%o, To=%o, Cc=%o, Bcc=%o, Subject=%s, TemplateType=%s)",
          payload.data.source,
          payload.data.replyTo,
          payload.data.to,
          payload.data.cc,
          payload.data.bcc,
          payload.data.subject,
          payload.data.type
        )
        const sendEmailResponse = await sesClient.send(sendEmailCommand)
        logger.info(
          "Received Response(Status=%s) from AWS SES after %s attempts",
          sendEmailResponse.$metadata.httpStatusCode ?? "<no code>",
          sendEmailResponse.$metadata.attempts ?? 1
        )

        // AWS SQS messages have to be marked as deleted by the consumer in order to be discarded from the queue. If
        // we do not do this, the user will receive multiple emails.
        const deleteMessageCommand = new DeleteMessageCommand({
          QueueUrl: configuration.email.awsSqsQueueUrl,
          ReceiptHandle: message.ReceiptHandle,
        })
        const deleteMessageResponse = await sqsClient.send(deleteMessageCommand)
        logger.info(
          "Received Response(Status=%s) from AWS SES after %s attempts",
          deleteMessageResponse.$metadata.httpStatusCode ?? "<no code>",
          deleteMessageResponse.$metadata.attempts ?? 1
        )
      } finally {
        span.end()
      }
    })
  }

  return {
    async send(source, replyTo, to, cc, bcc, subject, definition, data) {
      return await tracer.startActiveSpan("EmailService/QueueEmail", async (span) => {
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

          // NOTE: These are not SEMCONV attributes. See https://opentelemetry.io/blog/2025/how-to-name-your-span-attributes/
          span.addEvent("@aws-sdk/client-ses#SendEmailCommand", {
            "email.source": source,
            "email.replyTo": replyTo,
            "email.to": to,
            "email.cc": cc,
            "email.bcc": bcc,
            "email.subject": subject,
          })

          const cmd = new SendMessageCommand({
            QueueUrl: configuration.email.awsSqsQueueUrl,
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
            configuration.email.awsSqsQueueUrl
          )
        } finally {
          span.end()
        }
      })
    },
    startWorker(signal) {
      let interval: ReturnType<typeof setTimeout> | null = null
      async function work() {
        await tracer.startActiveSpan("EmailService/DiscoverEmails", { root: true }, async (span) => {
          try {
            // Queue the next recursive call as long as the abort controller hasn't been aborted.
            function enqueueWork() {
              if (!signal.aborted) {
                interval = setTimeout(work, configuration.email.awsSqsWorkerInterval)
              }
            }

            const command = new ReceiveMessageCommand({
              QueueUrl: configuration.email.awsSqsQueueUrl,
              MaxNumberOfMessages: 3,
              WaitTimeSeconds: 20,
              VisibilityTimeout: 30,
            })
            // Cancelling the root abort controller should also kill the SQS Long Polling.
            const response = await sqsClient.send(command, { abortSignal: signal })
            const messages = response.Messages

            if (messages === undefined || messages.length === 0) {
              enqueueWork()
              return
            }

            logger.info(
              "Discovered %s emails to deliver from SQS Queue(Url=%s)",
              messages.length,
              configuration.email.awsSqsQueueUrl
            )

            try {
              const promises = messages.map(processSqsMessage)
              await Promise.all(promises)
            } catch (error) {
              if (error instanceof Error) {
                span.setStatus({ code: SpanStatusCode.ERROR })
                span.recordException(error)
                throw error
              }
            }
            enqueueWork()
          } finally {
            span.end()
          }
        })
      }

      interval = setTimeout(work, configuration.email.awsSqsWorkerInterval)

      logger.info("Starting TaskExecutor with interval of %d milliseconds", configuration.email.awsSqsWorkerInterval)

      signal.addEventListener("abort", () => {
        if (interval !== null) {
          clearInterval(interval)
        }
      })
    },
  }
}
