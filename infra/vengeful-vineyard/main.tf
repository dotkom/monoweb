locals {
  vengeful_project_name       = "vengeful-vineyard-${terraform.workspace}"
  vengeful_domain_name        = terraform.workspace == "prd" ? "vinstraff.no" : "${terraform.workspace}.vinstraff.no"
  vengeful_server_domain_name = terraform.workspace == "prd" ? "api.vinstraff.no" : "${terraform.workspace}.api.vinstraff.no"
  zone_id                     = data.aws_route53_zone.vinstraff.zone_id
}

module "vengeful_database" {
  source = "../modules/neon-project"

  project_name = local.vengeful_project_name
  role_name    = "vengeful"
}

module "vengeful_vineyard_server_certificate" {
  source = "../modules/aws-lightsail-certificate"

  certificate_name   = "vengeful-vineyard-server-${terraform.workspace}"
  public_domain_name = local.vengeful_server_domain_name
  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}

module "vengeful_vineyard_server" {
  source = "../modules/aws-lightsail-container-service"

  dns_zone_id           = data.aws_route53_zone.vinstraff.zone_id
  public_domain_name    = local.vengeful_server_domain_name
  service_name          = "vengeful-server-${terraform.workspace}"
  environment_variables = data.doppler_secrets.vengeful.map
  image_tag             = "0.2.2"

  certificate_domain_validation_options = module.vengeful_vineyard_server_certificate.certificate_domain_validation_options
  certificate_name                      = module.vengeful_vineyard_server_certificate.certificate_name

  healthcheck_timeout = 10

  container_port = 8000
  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}

module "vengeful_vineyard_bucket_certificate" {
  source = "../modules/aws-acm-certificate"

  domain  = local.vengeful_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.us-east-1
  }
}

module "vengeful_vineyard_bucket" {
  source = "../modules/aws-s3-public-bucket"

  domain_name     = local.vengeful_domain_name
  certificate_arn = module.vengeful_vineyard_bucket_certificate.certificate_arn
  zone_id         = local.zone_id

  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}
