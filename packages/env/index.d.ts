export declare type EnvironmentKeys =
  | "AWS_REGION"
  | "DASHBOARD_AUTH0_CLIENT_ID"
  | "DASHBOARD_AUTH0_CLIENT_SECRET"
  | "DASHBOARD_AUTH0_ISSUER"
  | "DATABASE_URL"
  | "EMAIL_SECRET"
  | "FAGKOM_STRIPE_PUBLIC_KEY"
  | "FAGKOM_STRIPE_SECRET_KEY"
  | "FAGKOM_STRIPE_WEBHOOK_SECRET"
  | "GTX_AUTH0_CLIENT_ID"
  | "GTX_AUTH0_CLIENT_SECRET"
  | "GTX_AUTH0_ISSUER"
  | "NEXT_PUBLIC_NODE_ENV"
  | "NEXT_PUBLIC_VERCEL_URL"
  | "NEXTAUTH_SECRET"
  | "NODE_ENV"
  | "S3_BUCKET_MONOWEB"
  | "TRIKOM_STRIPE_PUBLIC_KEY"
  | "TRIKOM_STRIPE_SECRET_KEY"
  | "TRIKOM_STRIPE_WEBHOOK_SECRET"
  | "VERCEL_URL"
  | "WEB_AUTH0_CLIENT_ID"
  | "WEB_AUTH0_CLIENT_SECRET"
  | "WEB_AUTH0_ISSUER"
  | "RPC_HOST"
  | "RPC_ALLOWED_ORIGINS"

export declare type Environment = Record<EnvironmentKeys, string>

export declare const createEnvironment: (skipValidation?: boolean) => Environment
export declare const env: Environment
