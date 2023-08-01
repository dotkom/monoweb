import { stripeHandler } from "@dotkomonline/gateway-edge"

export default stripeHandler

// Required by stripe
export const config = {
  api: {
    bodyParser: false,
  },
}
