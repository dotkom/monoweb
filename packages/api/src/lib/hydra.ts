import { Configuration, OAuth2Api as HydraApiClient } from "@ory/client"

export const hydraAdmin = new HydraApiClient(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
  })
)
