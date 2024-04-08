import { createServiceLayer } from "./service-layer"
import repl from 'repl';


const core = await createServiceLayer()
// Start the REPL
const replServer = repl.start({
  prompt: '> ',
});

// Attach your module to the REPL context
replServer.context.core = core;