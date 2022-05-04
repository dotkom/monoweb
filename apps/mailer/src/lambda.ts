import { MailService, initMailService } from "./mail-service"
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { initMarkdownService } from "./markdown-service"
import { mailSchema } from "./mail"
import { type AWSError } from "aws-sdk"

const markdownService = initMarkdownService()
const mailService: MailService = initMailService(markdownService)

const response = (code: number, body: string): APIGatewayProxyResult => ({
  statusCode: code,
  body,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const raw = JSON.parse(event.body ?? "")
    const data = mailSchema.safeParse(raw)
    if (data.success) {
      await mailService.send(data.data)
      return response(201, "OK")
    }
    return response(400, data.error.message)
  } catch (err) {
    // two possible paths: JSON.parse error, or AWS service error
    if (isAmazonError(err)) {
      return response(500, err.message)
    }
    return response(400, "invalid json body")
  }
}

const isAmazonError = (err: unknown): err is AWSError => {
  return !!err && typeof err === "object" && "time" in err && "message" in err && "code" in err
}
