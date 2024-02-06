locals {
  dashboard_callback_urls = concat(
    ["https://${terraform.workspace}.dashboard.online.ntnu.no/api/auth/callback/cognito"],
    terraform.workspace == "dev"
    ? ["http://localhost:3002/api/auth/callback/cognito"]
    : [],
    terraform.workspace == "prd"
    ? ["https://dashboard.online.ntnu.no/api/auth/callback/cognito"]
    : []
  )
  dashboard_domain_name = "${terraform.workspace}.dashboard.online.ntnu.no"
}

module "dashboard_cognito_client" {
  source = "../modules/aws-cognito-client"

  user_pool_id  = data.aws_cognito_user_pools.user_pools.ids[0]
  client_name   = "dashboard"
  callback_urls = local.dashboard_callback_urls
}

module "dashboard_vercel_project" {
  source = "../modules/vercel-application"

  project_name   = "dashboard"
  domain_name    = local.dashboard_domain_name
  zone_id        = local.zone_id
  build_command  = "cd ../.. && pnpm build:dashboard"
  root_directory = "apps/dashboard"
}
