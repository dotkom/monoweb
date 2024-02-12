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
  web_project_name = "web-${terraform.workspace}"
}

module "web_database" {
  source = "../modules/neon-project"

  project_name = local.web_project_name
  role_name    = "web"
}

module "web_cognito_client" {
  source = "../modules/aws-cognito-client"

  user_pool_id  = data.aws_cognito_user_pools.user_pools.ids[0]
  client_name   = "web"
  callback_urls = local.web_callback_urls
}
