import SES from "aws-sdk/clients/ses"
import { MailSchema } from "./mail"
import { MarkdownService } from "./markdown-service"
import { TemplateService } from "./template-service"

export type MailRequest = MailSchema

export interface MailService {
  send(request: MailRequest): Promise<void>
}

export const initMailService = (markdownService: MarkdownService, templateService: TemplateService): MailService => {
  const ses = new SES({ region: "eu-north-1" })
  return {
    send: async (request: MailRequest) =>
      ses
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
                Data: templateService.render("base", {
                  body: markdownService.transform(request.body),
                }),
              },
            },
          },
        })
        .promise()
        .then(() => undefined), // SendEmailResponse only provides an AWS MessageId, discard it
  }
}
