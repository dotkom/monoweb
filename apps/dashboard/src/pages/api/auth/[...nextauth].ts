import NextAuth from "next-auth";
import { dashboard as authOptions } from "@dotkomonline/auth";

export default NextAuth(authOptions);
