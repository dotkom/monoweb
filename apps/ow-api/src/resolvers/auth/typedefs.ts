import { objectType } from "nexus"

export const User = objectType({
  name: "User",
  description: "A generic Onlineweb user",
  definition(t) {
    t.string("id")
    t.string("username")
    t.string("email")
    t.string("firstName")
    t.string("lastName")
  },
})
