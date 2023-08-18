resource "aws_cognito_user_pool" "cognito" {
  name                     = "monoweb-${terraform.workspace}"
  mfa_configuration        = "OFF"
  auto_verified_attributes = ["email"]

  user_pool_add_ons {
    advanced_security_mode = "OFF"
  }

  password_policy {
    minimum_length                   = 8
    temporary_password_validity_days = 3
  }

  username_attributes = ["email"]
  username_configuration {
    case_sensitive = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Online brukeraktivering"
    email_message        = "Din bekreftelseskode er {####}"
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "monoweb" {
  name         = "monoweb"
  user_pool_id = aws_cognito_user_pool.cognito.id

  access_token_validity                = 1
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  generate_secret = true
  callback_urls = concat(
    ["https://${terraform.workspace}.online.ntnu.no/api/auth/callback/google"],
    terraform.workspace == "dev"
    ? ["http://localhost:3000/api/auth/callback/cognito"]
    : [],
    terraform.workspace == "prd"
    ? ["https://online.ntnu.no/api/auth/callback/google"]
    : []
  )
}

resource "aws_cognito_user_pool_domain" "domain" {
  user_pool_id = aws_cognito_user_pool.cognito.id
  domain       = "auth.${terraform.workspace}.online.ntnu.no"
  certificate_arn = aws_acm_certificate.domain_certificate.arn
}
