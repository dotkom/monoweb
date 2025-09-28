import repl from "node:repl"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

replServer.context.core = serviceLayer
replServer.context.prisma = serviceLayer.prisma
