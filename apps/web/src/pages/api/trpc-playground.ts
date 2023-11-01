import { appRouter } from "@dotkomonline/gateway-trpc"
import { type NextApiHandler } from "next"
import { nextHandler } from "trpc-playground/handlers/next"

const setupHandler = nextHandler({
  router: appRouter,
  trpcApiEndpoint: "/api/trpc",
  playgroundEndpoint: "/api/trpc-playground",
  request: {
    superjson: true,
  },
})

const handler: NextApiHandler = async (req, res) => {
  const playgroundHandler = await setupHandler
  await playgroundHandler(req, res)
}

export default handler
