import { getAuthOptions } from "./auth-options";
import { env } from "@dotkomonline/env";

export const authOptions = getAuthOptions({
  cognitoClientId: env.WEB_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.WEB_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.WEB_COGNITO_ISSUER,
});
