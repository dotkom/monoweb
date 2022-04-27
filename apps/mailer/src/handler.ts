import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import SES from "aws-sdk/clients/ses"
import { mailSchema, mapToSES } from "./schema"

const ses = new SES({ region: "eu-north-1" })

const buildReturnStmt = (statusCode: number, message?: string): APIGatewayProxyResult => ({
  statusCode,
  body: message ?? "OK",
})

export const handler: APIGatewayProxyHandler = async (event) => {
  const res = mailSchema.safeParse(event.body)
  if (!res.success) {
    return buildReturnStmt(400, res.error.message)
  }
  try {
    const data = mapToSES(res.data)
    await ses.sendEmail(data).promise()
  } catch (error) {
    return buildReturnStmt(500, `Failed to send email: ${error}`)
  }
  return buildReturnStmt(201)
}
