import NextAuth from "next-auth";
import { web as authOptions } from "@dotkomonline/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
