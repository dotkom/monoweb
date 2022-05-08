import { type AWSError } from "aws-sdk"
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { initMailService } from "./mail-service"
import { initTemplateService } from "./template-service"
import { mailSchema } from "./mail"

const ACCESS_TOKEN =
  process.env.SECRET ??
  (() => {
    throw new Error("SECRET env var is not set")
  })()

const templateService = initTemplateService()
const mailService = initMailService()

const response = (code: number, body: string): APIGatewayProxyResult => ({
  statusCode: code,
  body,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const raw = JSON.parse(event.body ?? "{}")

    // authenticate request based on environment variable in AWS lambda
    const accessToken = event.headers["X-Api-Key"]
    if (accessToken !== ACCESS_TOKEN) {
      return response(401, "Invalid access token")
    }

    const schema = mailSchema.safeParse(raw)
    if (schema.success) {
      await mailService.send({
        ...schema.data,
        body: templateService.render(schema.data.template, {
          body: templateService.transform(schema.data.body),
        }),
      })
      return response(201, "OK")
    }
    return response(400, schema.error.message)
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
