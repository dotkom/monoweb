import type { S3Client } from "@aws-sdk/client-s3"
import { type SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import type { SQSClient } from "@aws-sdk/client-sqs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import type { ConfigurationWithAmazonSesEmail } from "../../configuration"
import type { EmailType } from "./email-template"
import { getEmailService } from "./email-service"

const { getImageUrl } = vi.hoisted(() => ({ getImageUrl: vi.fn() }))
vi.mock("./email-image", () => ({ getEmailImageService: () => ({ getImageUrl }) }))

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

async function deliverEmail(type: EmailType, eventImageUrl: string | null) {
  vi.useFakeTimers()
  const emailClient = mockDeep<SESClient>()
  const queueClient = mockDeep<SQSClient>()
  const storageClient = mockDeep<S3Client>()
  const configuration = mockDeep<ConfigurationWithAmazonSesEmail>()
  configuration.email.awsSqsQueueUrl = "https://sqs.example.com/email"
  configuration.email.awsSqsWorkerInterval = 100
  const controller = new AbortController()
  emailClient.send.mockResolvedValue({ $metadata: {} })
  queueClient.send.mockResolvedValueOnce({
    Messages: [
      {
        MessageId: "message-id",
        ReceiptHandle: "receipt-handle",
        Body: JSON.stringify({
          source: "varslinger@online.ntnu.no",
          replyTo: [],
          to: ["recipient@example.com"],
          cc: [],
          bcc: [],
          subject: "Testarrangement",
          type,
          data: {
            eventName: "Testarrangement",
            eventLink: "https://online.ntnu.no/arrangementer/test",
            eventImageUrl,
            deregistrationDeadline: "2026-10-25T12:00:00Z",
            feedbackLink: "https://online.ntnu.no/tilbakemelding/test",
            eventStart: "2026-10-25T12:00:00Z",
            feedbackDeadline: "2026-10-26T12:00:00Z",
            organizerEmail: "dotkom@online.ntnu.no",
            message: "Velkommen!",
            position: 2,
          },
        }),
      },
    ],
  })
  queueClient.send.mockResolvedValue({ $metadata: {} })
  const service = getEmailService(emailClient, queueClient, storageClient, configuration)
  service.startWorker(controller.signal)

  try {
    await vi.advanceTimersByTimeAsync(100)
    await vi.waitFor(() => expect(emailClient.send).toHaveBeenCalledTimes(1))
  } finally {
    controller.abort()
  }

  expect(emailClient.send).toHaveBeenCalledTimes(1)
  const emailCommand = emailClient.send.mock.calls[0][0]
  expect(emailCommand).toBeInstanceOf(SendEmailCommand)
  if (!(emailCommand instanceof SendEmailCommand)) {
    throw new Error("Expected an email delivery")
  }

  return emailCommand.input.Message?.Body?.Html?.Data
}

describe("event email image preparation", () => {
  it.each([
    "EVENT_ATTENDANCE",
    "EVENT_MESSAGE",
    "FEEDBACK_FORM_LINK",
    "QUEUE_NOTIFICATION",
  ] as const)("sends %s with the prepared image URL", async (type) => {
    getImageUrl.mockResolvedValue("https://cdn.online.ntnu.no/email/email-variant.jpg")

    const emailMarkup = await deliverEmail(type, "https://cdn.online.ntnu.no/event/original.png")

    expect(getImageUrl).toHaveBeenCalledWith("https://cdn.online.ntnu.no/event/original.png")
    expect(emailMarkup).toContain("email-variant.jpg")
    expect(emailMarkup).not.toContain("original.png")
  })

  it("still sends the notification when image preparation returns no image", async () => {
    getImageUrl.mockResolvedValue(null)

    const emailMarkup = await deliverEmail("EVENT_ATTENDANCE", "https://cdn.online.ntnu.no/event/original.png")

    expect(emailMarkup).toContain("Du er påmeldt Testarrangement")
    expect(emailMarkup).not.toContain('alt="Testarrangement"')
  })
})
