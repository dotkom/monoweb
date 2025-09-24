import { type SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { ReceiveMessageCommand, type SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { getLogger } from "@dotkomonline/logger"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import mustache from "mustache"
import z from "zod"
import type { Configuration } from "../../configuration"
import { IllegalStateError, InvalidArgumentError } from "../../error"
import { type EmailTemplate, type EmailType, type InferEmailData, emails } from "./email-template"

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
    startWorker(signal) {
      if (configuration.AWS_SQS_QUEUE_EMAIL_DELIVERY === null) {
        logger.warn("Cancelling posting of email due to disabled or missing AWS SQS email-delivery queue")
        return
      }
      const queueUrl = configuration.AWS_SQS_QUEUE_EMAIL_DELIVERY

      let interval: ReturnType<typeof setTimeout> | null = null
      async function work() {
        await tracer.startActiveSpan("@dotkomonline/rpc/email-delivery", { root: true }, async (span) => {
          try {
            // Queue the next recursive call as long as the abort controller hasn't been moved.
            function enqueueWork() {
              if (!signal.aborted) {
                interval = setTimeout(work, 1000)
              }
            }

            const command = new ReceiveMessageCommand({
              QueueUrl: queueUrl,
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

            logger.info("Discovered %s emails to deliver from SQS Queue(Url=%s)", messages.length, queueUrl)

            const commands: SendEmailCommand[] = []
            const errors: Error[] = []
            for (const message of messages) {
              if (message.Body === undefined) {
                errors.push(
                  new IllegalStateError(
                    `Received Message(ID=${message.MessageId ?? "<missing id>"}) with empty SQS MessageBody`
                  )
                )
                continue
              }
              const payload = EmailMessageSchema.safeParse(JSON.parse(message.Body))
              if (!payload.success) {
                logger.error(
                  "Failed to parse email payload for Message(ID=%s): %o with data payload %o",
                  message.MessageId ?? "<missing id>",
                  payload.error.message,
                  message.Body
                )
                errors.push(
                  new IllegalStateError(
                    `Failed to parse email payload for Message(ID=${message.MessageId ?? "<missing id>"})`
                  )
                )
                continue
              }

              const emailTemplate = emails[payload.data.type]
              if (emailTemplate === undefined) {
                errors.push(new IllegalStateError(`Failed to find email template for Type=${payload.data.type}`))
                continue
              }

              const template = await emailTemplate.getTemplate()

              const html = mustache.render(template, payload.data.data)
              const command = new SendEmailCommand({
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
              commands.push(command)
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
            }

            try {
              await Promise.all(commands.map((cmd) => sesClient.send(cmd, { abortSignal: signal })))
            } catch (error) {
              if (error instanceof Error) {
                errors.push(error)
              } else {
                logger.error("Failed to submit all commands to AWS SES: %o", error)
              }
            }

            // Error reporting on the span should only fail if one of the emails could not be processed or delivered.
            // We have to handle errors at the bottom here, as the `for` loop above should not early-return or exit the
            // enclosing `work` function.
            if (errors.length !== 0) {
              const error = new AggregateError(errors)
              span.setStatus({ code: SpanStatusCode.ERROR })
              span.recordException(error)
              throw error
            }

            enqueueWork()
          } finally {
            span.end()
          }
        })
      }

      interval = setTimeout(work, 1000)

      signal.addEventListener("abort", () => {
        if (interval !== null) {
          clearInterval(interval)
        }
      })
    },
  }
}
