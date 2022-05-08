import { type AWSError } from "aws-sdk"
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { initMailService } from "./mail-service"
import { initTemplateService, templates } from "./template-service"
import { mailSchema } from "./mail"

const templateService = initTemplateService()
const mailService = initMailService()

const response = (code: number, body: string): APIGatewayProxyResult => ({
  statusCode: code,
  body,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const raw = JSON.parse(event.body ?? "")

    // authenticate request based on environment variable in AWS lambda
    if (raw.token !== process.env.SECRET) return response(401, "Invalid access token")

    const data = mailSchema.safeParse(raw)
    if (data.success) {
      await mailService.send({
        ...data.data,
        body: templateService.render(data.data.template, {
          body: templateService.transform(data.data.body),
        }),
      })
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
