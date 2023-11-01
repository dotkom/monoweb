locals {
  cdn_domain_name = "${terraform.workspace}.cdn.online.ntnu.no"
}

module "cdn_domain_certificate" {
  source = "../modules/aws-acm-certificate"

  domain  = local.cdn_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.us-east-1
  }
}

module "static_bucket" {
  source          = "../modules/aws-s3-public-bucket"
  certificate_arn = module.cdn_domain_certificate.certificate_arn
  domain_name     = local.cdn_domain_name
  zone_id         = local.zone_id

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  depends_on = [module.cdn_domain_certificate]
}
