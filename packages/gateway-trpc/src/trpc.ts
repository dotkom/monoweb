import { TRPCError, initTRPC } from "@trpc/server";

import { type Context } from "./context";
import { transformer } from "./transformer";

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
  transformer,
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
