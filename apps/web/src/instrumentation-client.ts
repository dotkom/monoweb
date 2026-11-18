import { init } from "@dash0/sdk-web"
import "core-js/stable"

const endpointUrl = process.env.NEXT_PUBLIC_DASH0_ENDPOINT
const authToken = process.env.NEXT_PUBLIC_DASH0_AUTH_TOKEN
const dataset = process.env.NEXT_PUBLIC_DASH0_DATASET
const rpcHost = process.env.NEXT_PUBLIC_RPC_HOST
const environment = process.env.NEXT_PUBLIC_DOPPLER_ENVIRONMENT

if (
  endpointUrl !== undefined &&
  endpointUrl !== "" &&
  authToken !== undefined &&
  authToken !== "" &&
  dataset !== undefined &&
  dataset !== "" &&
  rpcHost !== undefined &&
  rpcHost !== ""
) {
  init({
    serviceName: "monoweb-web",
    environment,
    endpoint: {
      url: endpointUrl,
      authToken,
      dataset,
    },
    propagators: [{ type: "traceparent", match: [new RegExp(rpcHost)] }],
  })
}
