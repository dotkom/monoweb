import { getLogger } from "@dotkomonline/logger"

import { createServer } from "./server"

const logger = getLogger(import.meta.url)

if (process.env.NODE_ENV === "development") {
  const port = Number(process.env.API_PORT || 4000)
  const server = createServer()
  logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
  server.listen(port)
}
