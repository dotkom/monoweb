import repl from "node:repl"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"

const core = await createServiceLayer({ db: kysely })

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

// Make services available in the REPL
replServer.context.core = core
