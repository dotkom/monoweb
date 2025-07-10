import repl from "node:repl"
import { configuration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration.AWS_S3_BUCKET)

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

replServer.context.core = serviceLayer
replServer.context.prisma = serviceLayer.prisma
