import { stripeHandler } from "@dotkomonline/ow-gateway-edge"

export default stripeHandler

// Required by stripe
export const config = {
  api: {
    bodyParser: false,
  },
}
