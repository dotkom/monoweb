export declare type EnvironmentKeys =
  | "DASHBOARD_COGNITO_CLIENT_ID"
  | "DASHBOARD_COGNITO_CLIENT_SECRET"
  | "DASHBOARD_COGNITO_ISSUER"
  | "DATABASE_URL"
  | "EMAIL_SECRET"
  | "FAGKOM_STRIPE_PUBLIC_KEY"
  | "FAGKOM_STRIPE_SECRET_KEY"
  | "FAGKOM_STRIPE_WEBHOOK_SECRET"
  | "NEXT_PUBLIC_NODE_ENV"
  | "NEXT_PUBLIC_VERCEL_URL"
  | "NEXTAUTH_SECRET"
  | "NODE_ENV"
  | "TRIKOM_STRIPE_PUBLIC_KEY"
  | "TRIKOM_STRIPE_SECRET_KEY"
  | "TRIKOM_STRIPE_WEBHOOK_SECRET"
  | "VERCEL_URL"
  | "WEB_COGNITO_CLIENT_ID"
  | "WEB_COGNITO_CLIENT_SECRET"
  | "WEB_COGNITO_ISSUER"

export declare type Environment = Record<EnvironmentKeys, string>

export declare const createEnvironment: (skipValidation?: boolean) => Environment
export declare const env: Environment
