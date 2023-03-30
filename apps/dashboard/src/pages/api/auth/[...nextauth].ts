import NextAuth from "next-auth"
import { authOptions } from "../../../auth-options"

// Monkeypatching
process.env.NEXTAUTH_URL = "http://localhost:3002"

export default NextAuth(authOptions)
