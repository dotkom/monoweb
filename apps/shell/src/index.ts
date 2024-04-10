import { writeFileSync } from "fs"
import { createServiceLayer } from "@dotkomonline/core"
import { createKysely, kysely } from "@dotkomonline/db"

import repl from 'repl';

import { env } from "@dotkomonline/env"

console.log(env)

// biome-ignore lint/suspicious/noRedeclare: error
const db = createKysely(env)

if (env.NODE_ENV !== "production") {
  // @ts-expect-error: does not like re-declaring global
  global.kysely = kysely
}


async function test() {

  console.log(kysely)

const core = await createServiceLayer({
  db
})
// Start the REPL
const replServer = repl.start({
  prompt: '> ',
});

// Attach your module to the REPL context
replServer.context.core = core;

}

test()