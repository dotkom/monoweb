import { intArg, list, queryField, stringArg } from "nexus"

export const userQuery = queryField("user", {
  type: "User",
  args: {
    id: stringArg(),
  },
  resolve: async (_, args, ctx) => {
    const { id } = args
    const user = await ctx.userService.getUser(id)
    return user
  },
})

export const usersQuery = queryField("users", {
  type: list("User"),
  args: {
    limit: intArg({ default: 50 }),
  },
  resolve: async (_, args, ctx) => {
    return ctx.userService.getUsers(args.limit)
  },
})
