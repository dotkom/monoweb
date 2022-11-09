import { appRouter } from "@/router";



import { initTRPC } from "@trpc/server";



import { Context } from "./context";


// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
})

export type AppRouter = typeof appRouter