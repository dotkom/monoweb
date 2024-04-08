import { z } from "zod"
import { TransactionService } from "./transaction-service"
import { FileRepository, StateService } from "./state-service"
import { AwsWebSockService } from "./aws-websocket-service"
import { PubSubService } from "./google-pubsub-service"
import { type APIGatewayProxyEventV2 } from "aws-lambda"
import { GmailService } from "./gmail-service"

export const WebSocketRequestSchema = z.object({
  requestContext: z.object({
    routeKey: z.enum(["$connect", "$disconnect", "$default"]),
    connectionId: z.string(),
  }),
})

// { "route": "gmail-watch", "type": "eventbridge" }

export const EventBridgeEventSchema = z.object({
  route: z.string(),
  type: z.enum(["eventbridge"]),
})

type WebSocketRequest = z.infer<typeof WebSocketRequestSchema>

interface HttpResponse {
  statusCode: number
  body?: string
}

export interface BatmanService {
  handleHttpRequest(req: APIGatewayProxyEventV2): Promise<HttpResponse>
  handleWebSocketConnection(req: WebSocketRequest): Promise<HttpResponse>
  handleEvent(event: APIGatewayProxyEventV2): Promise<HttpResponse>
}

export class BatmanServiceImpl implements BatmanService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly stateService: StateService,
    private readonly awsWebSockService: AwsWebSockService,
    private readonly pubSubService: PubSubService,
    private readonly gmailService: GmailService
  ) {}

  async handleEvent(event: APIGatewayProxyEventV2): Promise<HttpResponse> {
    const webSocketRequest = WebSocketRequestSchema.safeParse(event)

    if (webSocketRequest.success) {
      const response = await this.handleWebSocketConnection(webSocketRequest.data)
      console.log("response", JSON.stringify(response, null, 2))
      return response
    }

    const eventBridgeEvent = EventBridgeEventSchema.safeParse(event)
    if (eventBridgeEvent.success) {
      const response = await this.handleEventBridgeEvent(eventBridgeEvent.data.route)
      console.log("response", JSON.stringify(response, null, 2))
      return response
    }

    if (event.requestContext?.http) {
      // HTTP request
      const response = await this.handleHttpRequest(event)
      console.log("response", JSON.stringify(response, null, 2))
      return response
    }

    console.log("Invalid event!")
    console.log("WebSocketRequest error", JSON.stringify(webSocketRequest.error, null, 2))
    console.log("EventBridgeEvent error", JSON.stringify(eventBridgeEvent.error, null, 2))

    return { statusCode: 200, body: "see logs, got neither websocket nor http event nor eventbridge event" }
  }

  async handleEventBridgeEvent(route: string) {
    if(route === "gmail-watch") {
      try {
        await this.gmailService.watch()
        console.log("Successfully watched gmail")
        return { statusCode: 200 }
      } catch (error) {
        console.log("Error watching gmail")
        console.error(JSON.stringify(error, null, 2))
        return { statusCode: 500, body: "Error watching gmail" }
      }
    }

    return { statusCode: 500, body: `Routes supported: gmail-watch, got: ${route}` }
  }

  async handleWebSocketConnection(req: WebSocketRequest) {
    switch (req.requestContext.routeKey) {
      case "$connect": {
        console.log("Handling $connect")
        const connectionId = req.requestContext.connectionId
        await this.stateService.addSocketConnectionId(connectionId)
        return { statusCode: 200 }
      }

      case "$disconnect": {
        console.log("Handling $disconnect")
        const connectionId = req.requestContext.connectionId
        await this.stateService.removeSocketConnectionId(connectionId)
        return { statusCode: 200 }
      }

      case "$default":
        return { statusCode: 200, body: "hello world!" }
    }
  }

  async handleHttpRequest(req: APIGatewayProxyEventV2) {
    const method = req.requestContext.http.method
    const path = req.requestContext.http.path

    const PATHS = {
      SYNC: "/sync",
      GMAIL_WEBHOOK: "/gmail-webhook",
      GET_STATE: "/",
      WATCH: "/watch",
    }

    switch (method) {
      case "GET":
        switch (path) {
          case PATHS.GET_STATE: {
            const state = await this.stateService.getFullState()
            return { statusCode: 200, body: JSON.stringify(state, null, 2) }
          }
          default: {
            return { statusCode: 200, body: "hello world GET!" }
          }
        }
      case "POST": {
        switch (path) {
          case PATHS.WATCH: {
            try {
              await this.gmailService.watch()
              return { statusCode: 200 }
            } catch (error) {
              console.log("Error watching gmail")
              console.error(JSON.stringify(error, null, 2))
              return { statusCode: 500, body: "Error watching gmail" }
            }
          }
          case PATHS.SYNC: {
            const transactions = await this.transactionService.syncTransactions(10)
            await this.awsWebSockService.broadcastToClients(JSON.stringify(transactions))
            return { statusCode: 200 }
          }
          case PATHS.GMAIL_WEBHOOK: {
            try {
              const historyId = this.pubSubService.getHistoryIdFromReq(req)
              console.log("Got new history id", historyId)
              const transactions = await this.transactionService.handleNewTransactions(historyId, 10)
              await this.awsWebSockService.broadcastToClients(JSON.stringify(transactions))
              return { statusCode: 200 }
            } catch (error) {
              console.log("Error handling gmail webhook endpoint")
              console.error(JSON.stringify(error, null, 2))
              // Return 200 to avoid gcloud from retrying the request
              return { statusCode: 200 }
            }
          }
          default: {
            return { statusCode: 200, body: "Path not supported" }
          }
        }
      }
      default:
        return { statusCode: 200, body: "hello world other method!" }
    }
  }
}
