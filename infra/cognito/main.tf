locals {
  cognito_domain_name = "${terraform.workspace}.auth.online.ntnu.no"
  zone_id             = data.aws_route53_zone.online.zone_id
}

module "cognito_domain_certificate" {
  source = "../modules/aws-acm-certificate"

  domain  = local.cognito_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.us-east-1
  }
}

module "cognito_user_pool" {
  source = "../modules/aws-cognito-pool"

  pool_name       = "monoweb-${terraform.workspace}"
  custom_domain   = local.cognito_domain_name
  zone_id         = local.zone_id
  certificate_arn = module.cognito_domain_certificate.certificate_arn
  triggers = {
    post_confirmation = terraform.workspace == "dev" ? data.aws_lambda_function.post_signup_trigger[0].arn : null
  }
  schema = [
    {
      name                = "email"
      attribute_data_type = "String"
      mutable             = true
      required            = true
    },
    {
      name                = "given_name"
      attribute_data_type = "String"
      mutable             = true
      required            = true
    },
    {
      name                = "family_name"
      attribute_data_type = "String"
      mutable             = true
      required            = true
    },
    {
      name                = "gender"
      attribute_data_type = "String"
      mutable             = true
      required            = true
    }
  ]
  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  depends_on = [module.cognito_domain_certificate]
}

resource "aws_lambda_permission" "post_signup_trigger" {
  count = terraform.workspace == "dev" ? 1 : 0

  statement_id  = "CognitoExecuteLambda"
  action        = "lambda:InvokeFunction"
  principal     = "cognito-idp.amazonaws.com"
  function_name = data.aws_lambda_function.post_signup_trigger[0].function_name
  source_arn    = module.cognito_user_pool.cognito_pool_arn
}
