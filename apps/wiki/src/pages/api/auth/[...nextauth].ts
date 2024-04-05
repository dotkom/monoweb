import NextAuth from "next-auth"
import { wiki as authOptions } from "@dotkomonline/auth"

export default NextAuth(authOptions)
