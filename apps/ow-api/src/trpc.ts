import { initTRPC } from "@trpc/server"

import { Context } from "./index.js"

export const t = initTRPC.context<Context>().create()
