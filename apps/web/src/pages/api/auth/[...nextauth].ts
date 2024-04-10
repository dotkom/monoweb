import { web as authOptions } from "@dotkomonline/auth"
import NextAuth from "next-auth"

console.log(authOptions.callbacks?.session)

export default NextAuth(authOptions)
