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
}

module "web_cognito_client" {
  source = "./modules/aws-cognito-client"

  user_pool_id  = module.cognito_user_pool.cognito_pool_id
  client_name   = "web"
  callback_urls = local.web_callback_urls
}
