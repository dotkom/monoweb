import { mutationField, stringArg } from "nexus"

export const loginMutation = mutationField("login", {
  type: "String",
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async (root, args, ctx) => {
    ctx.userService.register
    return "Hello World"
  },
})
