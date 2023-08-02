import { stripeHandler } from "@dotkomonline/gateway-edge-nextjs"

export default stripeHandler

// Required by stripe
export const config = {
  api: {
    bodyParser: false,
  },
}
