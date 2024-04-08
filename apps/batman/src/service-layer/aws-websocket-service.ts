import { StateService } from "./state-service"
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"

export interface AwsWebSockService {
  broadcastToClients(message: string): Promise<void>
}

export class AwsWebSockServiceImpl implements AwsWebSockService {
  constructor(
    private stateService: StateService,
    private apigtwClient: ApiGatewayManagementApiClient
  ) {}

  async _sendToClient(connectionId: string, message: string) {
    const input = {
      // PostToConnectionRequest
      Data: message,
      ConnectionId: connectionId,
    }

    const command = new PostToConnectionCommand(input)
    await this.apigtwClient.send(command)
  }

  async broadcastToClients(message: string) {
    const clients = await this.stateService.getSocketConnectionIds()
    for (const connectionId of clients) {
      try {
        await this._sendToClient(connectionId, message)
      } catch (e) {
        console.error("Error sending message to client", connectionId, e)
        this.stateService.removeSocketConnectionId(connectionId)
      }
    }
  }
}
