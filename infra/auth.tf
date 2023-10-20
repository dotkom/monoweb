locals {
  cognito_domain_name = "${terraform.workspace}.auth.online.ntnu.no"
  zone_id             = data.aws_route53_zone.online.zone_id
}

# Required because AWS Cognito requires an A record at the parent domain
resource "aws_route53_record" "null_record" {
  name    = "auth.online.ntnu.no"
  type    = "A"
  zone_id = local.zone_id
  ttl     = 3600
  records = ["127.0.0.1"]
}

module "cognito_domain_certificate" {
  source = "./modules/aws-acm-certificate"

  domain  = local.cognito_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  providers = {
    aws.us-east-1 = aws.us-east-1
  }
}

module "cognito_user_pool" {
  source = "./modules/aws-cognito-pool"

  pool_name       = "monoweb-${terraform.workspace}"
  custom_domain   = local.cognito_domain_name
  zone_id         = local.zone_id
  certificate_arn = module.cognito_domain_certificate.certificate_arn
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

  depends_on = [module.cognito_domain_certificate, aws_route53_record.null_record]
}
