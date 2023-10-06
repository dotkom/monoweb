export declare type EnvironmentKeys =
  | "DASHBOARD_COGNITO_CLIENT_ID"
  | "DASHBOARD_COGNITO_CLIENT_SECRET"
  | "DASHBOARD_COGNITO_ISSUER"
  | "WEB_COGNITO_CLIENT_ID"
  | "WEB_COGNITO_CLIENT_SECRET"
  | "WEB_COGNITO_ISSUER"
  | "NODE_ENV"
  | "NEXT_PUBLIC_NODE_ENV"
  | "DATABASE_URL"
  | "NEXTAUTH_SECRET"
  | "VERCEL_URL"
  | "NEXT_PUBLIC_VERCEL_URL"
  | "TRIKOM_STRIPE_PUBLIC_KEY"
  | "TRIKOM_STRIPE_SECRET_KEY"
  | "TRIKOM_STRIPE_WEBHOOK_SECRET"
  | "FAGKOM_STRIPE_PUBLIC_KEY"
  | "FAGKOM_STRIPE_SECRET_KEY"
  | "FAGKOM_STRIPE_WEBHOOK_SECRET";

export declare type Environment = Record<EnvironmentKeys, string>;

export declare const createEnvironment: () => Environment;
export declare const env: Environment;
