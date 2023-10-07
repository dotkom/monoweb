import { env } from "@dotkomonline/env";

import { getAuthOptions } from "./auth-options";

export const authOptions = getAuthOptions({
  cognitoClientId: env.DASHBOARD_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.DASHBOARD_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.DASHBOARD_COGNITO_ISSUER,
});
