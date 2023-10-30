export declare type EnvironmentKeys =
  | "DASHBOARD_COGNITO_CLIENT_ID"
  | "DASHBOARD_COGNITO_CLIENT_SECRET"
  | "DASHBOARD_COGNITO_ISSUER"
  | "DATABASE_URL"
  | "EMAIL_SECRET"
  | "FAGKOM_STRIPE_PUBLIC_KEY"
  | "FAGKOM_STRIPE_SECRET_KEY"
  | "FAGKOM_STRIPE_WEBHOOK_SECRET"

export declare type Environment = Record<EnvironmentKeys, string>

export declare const createEnvironment: () => Environment
export declare const env: Environment
