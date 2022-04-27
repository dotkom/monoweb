import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { SES } from "aws-sdk"
import { SendEmailRequest } from "aws-sdk/clients/ses"
import { mailSchema } from "./schema"

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
    const data: SendEmailRequest = {
      Source: res.data.sender,
      Destination: { ToAddresses: [res.data.recipient] },
      Message: {
        Subject: { Data: res.data.subject },
        Body: {
          Text: {
            Data: res.data.body,
          },
        },
      },
    }
    await ses.sendEmail(data).promise()
  } catch (error) {
    return buildReturnStmt(500, `Failed to send email: ${error}`)
  }
  return buildReturnStmt(201)
}
