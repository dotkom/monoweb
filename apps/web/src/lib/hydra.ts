import { Configuration, OAuth2Api as HydraApiClient } from "@ory/client"
import { env } from "../env/server.mjs"

export const hydraAdmin = new HydraApiClient(
  new Configuration({
    basePath: env.HYDRA_ADMIN_URL,
  })
)
