import { stripeHandler } from "@dotkomonline/api"

export default stripeHandler

// Required by stripe
export const config = {
  api: {
    bodyParser: false,
  },
}
