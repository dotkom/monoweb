import { type APIGatewayProxyEventV2 } from "aws-lambda"
import { z } from "zod"

export interface PubSubService {
  getHistoryIdFromReq(request: APIGatewayProxyEventV2): string
}

export class PubSubServiceImpl implements PubSubService {
  getHistoryIdFromReq(_request: APIGatewayProxyEventV2): string {
    const BodySchema = z.object({
      message: z.object({
        data: z.string(),
      }),
    })

    if (!_request.body) {
      throw new Error("Request body is missing")
    }

    const body = JSON.parse(_request.body)

    const messageDataRaw = BodySchema.parse(body).message.data

    try {
      const messageData = JSON.parse(Buffer.from(messageDataRaw, "base64").toString("utf-8"))
      const historyId = messageData.historyId
      return String(historyId)
    } catch (error) {
      console.error(error)
      throw new Error("Failed to parse historyId from google pubsub webhook request")
    }
  }
}
