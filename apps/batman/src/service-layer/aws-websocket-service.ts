import { StateService } from "./state-service"
import { ApiGatewayManagementApiClient, DeleteConnectionCommand, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"

export interface AwsWebSockService {
  broadcastToClients(message: string): Promise<void>
  disconnectClient(connectionId: string): Promise<void>
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

  async disconnectClient(connectionId: string) {
    const command = new DeleteConnectionCommand({
      ConnectionId: connectionId,
    });

    try {
      await this.apigtwClient.send(command);
      console.log(`Disconnected client ${connectionId}`);
      this.stateService.removeSocketConnectionId(connectionId);
    } catch (e) {
      console.error("Error disconnecting client", connectionId, e);
    }
  }
}
