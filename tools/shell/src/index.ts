import repl from "node:repl"
import { core, prisma } from "./services"

console.warn("The monoweb shell does not support s3, auth0, or stripe operations at this time.")

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

// Make services available in the REPL
replServer.context.core = core
replServer.context.prisma = prisma
