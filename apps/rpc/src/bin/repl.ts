import repl from "node:repl"
import { configuration } from "../configuration.ts"
import { createServiceLayer, createThirdPartyClients } from "../modules/core.ts"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

replServer.context.core = serviceLayer
replServer.context.prisma = serviceLayer.prisma
