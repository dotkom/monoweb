resource "aws_cognito_user_pool_client" "this" {
  name         = var.client_name
  user_pool_id = var.user_pool_id

  supported_identity_providers = ["COGNITO"]

  access_token_validity                = 1
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  generate_secret = true
  callback_urls   = var.callback_urls
}
