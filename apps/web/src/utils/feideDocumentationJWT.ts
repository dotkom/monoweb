import { env } from "@dotkomonline/env";
import { FeideDocumentation, FeideDocumentationSchema } from "@dotkomonline/types";
import jwt from "jsonwebtoken";

export const createFeideDocumentationJWT = (documentation: FeideDocumentation) => (
  jwt.sign(FeideDocumentationSchema.parse(documentation), env.NEXTAUTH_SECRET, {
    expiresIn: "1d",
  })
)

export const verifyFeideDocumentationJWT = async (token: string) => (
  FeideDocumentationSchema.parse(jwt.verify(token, env.NEXTAUTH_SECRET))
)
