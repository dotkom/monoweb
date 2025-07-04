import repl from "node:repl"
import { getLogger } from "@dotkomonline/logger"
import { core, prisma } from "./services"

const logger = getLogger("shell")
logger.warn("The monoweb shell does not support s3, auth0, or stripe operations at this time.")

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

// Make services available in the REPL
replServer.context.core = core
replServer.context.prisma = prisma
