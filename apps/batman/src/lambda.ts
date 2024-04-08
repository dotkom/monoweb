import { createServiceLayer } from "./service-layer"
import { type APIGatewayProxyEventV2, type APIGatewayProxyResultV2, type Handler } from "aws-lambda"

export const handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  const core = await createServiceLayer()
  console.log("core successfully created")
  try {
    const res = await core.batmanService.handleEvent(event)
    console.log("response from handler", JSON.stringify(res, null, 2))
    // core.observabilityService.notify(`Handled event: ${JSON.stringify(event, null, 2)} response was: ${JSON.stringify(res, null, 2)}`)
    return res
  } catch (e) {
    console.error(JSON.stringify(e, null, 2))
    console.error(e)
    // core.observabilityService.notify(`Failed to handle event: ${JSON.stringify(e, null, 2)} request was: ${JSON.stringify(event, null, 2)}`)
    return { statusCode: 200, body: "Internal server error" }
  }
}
