import { z } from "zod";
import { t } from "../../trpc";

export const authRouter = t.router({
  signin: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        challenge: z.string(),
      })
    )
    .mutation((req) => {
      return { msg: "hello world" }
    }),
})
