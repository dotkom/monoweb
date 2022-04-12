import { mutationField, stringArg } from "nexus"

import { Context } from "../context"

export const loginMutation = mutationField("login", {
  type: "String",
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async (root, args, ctx: Context) => {
    const { email, password } = args
  },
})
