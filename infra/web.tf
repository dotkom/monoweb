locals {
  web_callback_urls = concat(
    ["https://${terraform.workspace}.web.online.ntnu.no/api/auth/callback/cognito"],
    terraform.workspace == "dev"
    ? ["http://localhost:3000/api/auth/callback/cognito"]
    : [],
    terraform.workspace == "prd"
    ? ["https://online.ntnu.no/api/auth/callback/cognito"]
    : []
  )
  web_domain_name  = "${terraform.workspace}.web.online.ntnu.no"
  web_project_name = "web-${terraform.workspace}"
}

module "web_database" {
  source = "./modules/neon-project"

  project_name = local.web_project_name
  role_name    = "web"
}

module "web_cognito_client" {
  source = "./modules/aws-cognito-client"

  user_pool_id  = module.cognito_user_pool.cognito_pool_id
  client_name   = "web"
  callback_urls = local.web_callback_urls
}

module "web_vercel_project" {
  source = "./modules/vercel-application"

  project_name   = "web"
  domain_name    = local.web_domain_name
  zone_id        = local.zone_id
  build_command  = "cd ../.. && pnpm build:web"
  root_directory = "apps/web"
}
