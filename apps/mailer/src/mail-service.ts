import SES from "aws-sdk/clients/ses"
import { MailSchema } from "./mail"
import { MarkdownService } from "./markdown-service"

export type MailRequest = MailSchema

export interface MailService {
  send(request: MailRequest): Promise<void>
}

export const initMailService = (markdownService: MarkdownService): MailService => {
  const ses = new SES({ region: "eu-north-1" })

  return {
    send: async (request: MailRequest) => {
      await ses
        .sendEmail({
          Source: request.sender,
          Destination: {
            ToAddresses: request.recipients,
            CcAddresses: request.carbonCopy,
            BccAddresses: request.blindCarbonCopy,
          },
          Message: {
            Subject: {
              Data: request.subject,
            },
            Body: {
              Html: {
                Data: await markdownService.transform(request.body),
              },
            },
          },
        })
        .promise()
    },
  }
}
