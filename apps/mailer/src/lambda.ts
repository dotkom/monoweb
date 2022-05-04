import { MailService, initMailService } from "./mail-service"
import { APIGatewayProxyHandler } from "aws-lambda"
import { initMarkdownService } from "./markdown-service"
import { mailSchema } from "./mail"

const markdownService = initMarkdownService()
const mailService: MailService = initMailService(markdownService)

export const handler: APIGatewayProxyHandler = async (event) => {
  const data = mailSchema.safeParse(event.body)
  if (data.success) {
    await mailService.send(data.data)
    return {
      statusCode: 201,
      body: "OK",
    }
  }
  return {
    statusCode: 400,
    body: data.error.message,
  }
}
