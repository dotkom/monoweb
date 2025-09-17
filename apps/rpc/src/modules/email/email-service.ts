import { type SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { getLogger } from "@dotkomonline/logger"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import mustache from "mustache"
import { InvalidArgumentError } from "../../error"
import type { EmailTemplate, InferEmailData } from "./email-template"

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

export function getEmailService(sesClient: SESClient): EmailService {
  const logger = getLogger("email-service")
  const tracer = trace.getTracer("@dotkomonline/monoweb-rpc/email-service")
  return {
    async send(source, replyTo, to, cc, bcc, subject, definition, data) {
      return await tracer.startActiveSpan("EmailService#send", async (span) => {
        try {
          logger.info(
            "Sending Email(From=%s, ReplyTo=%o, To=%o, Cc=%o, Bcc=%o, Subject=%s, TemplateType=%s)",
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
          const html = mustache.render(template, result.data)
          // NOTE: These are not SEMCONV attributes. See https://opentelemetry.io/blog/2025/how-to-name-your-span-attributes/
          span.addEvent("@aws-sdk/client-ses#SendEmailCommand", {
            "email.source": source,
            "email.replyTo": replyTo,
            "email.to": to,
            "email.cc": cc,
            "email.bcc": bcc,
            "email.subject": subject,
          })
          const command = new SendEmailCommand({
            Source: source,
            ReplyToAddresses: replyTo,
            Destination: {
              ToAddresses: to,
              CcAddresses: cc,
              BccAddresses: bcc,
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
                Data: subject,
              },
            },
          })
          const response = await sesClient.send(command)
          logger.info("Sent Email(MessageId=%s)", response.MessageId ?? "<unknown>")
        } finally {
          span.end()
        }
      })
    },
  }
}
