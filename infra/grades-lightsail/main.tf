locals {
  app_public_domain_name = terraform.workspace == "dev" ? "dev.grades.no" : "grades.no"
  api_public_domain_name = terraform.workspace == "dev" ? "api.dev.grades.no" : "api.grades.no"
}

module "gradestats_server_certificate" {
  source = "../modules/aws-lightsail-certificate"

  certificate_name   = "grades-server-${terraform.workspace}"
  public_domain_name = local.api_public_domain_name
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}

module "gradestats_server" {
  source = "../modules/aws-lightsail-container-service"

  dns_zone_id           = data.aws_route53_zone.grades.zone_id
  public_domain_name    = local.api_public_domain_name
  service_name          = "gradestats-server-${terraform.workspace}"
  environment_variables = data.doppler_secrets.grades.map
  image_tag             = "0.1.1"

  certificate_domain_validation_options = module.gradestats_server_certificate.certificate_domain_validation_options
  certificate_name                      = module.gradestats_server_certificate.certificate_name

  container_port = 8081
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}

module "gradestats_web_certificate" {
  source = "../modules/aws-lightsail-certificate"

  certificate_name   = "grades-web-${terraform.workspace}"
  public_domain_name = local.app_public_domain_name
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}

module "gradestats_web" {
  source = "../modules/aws-lightsail-container-service"

  dns_zone_id           = data.aws_route53_zone.grades.zone_id
  public_domain_name    = local.app_public_domain_name
  service_name          = "gradestats-web-${terraform.workspace}"
  environment_variables = data.doppler_secrets.grades.map
  image_tag             = "0.1.1"

  certificate_domain_validation_options = module.gradestats_web_certificate.certificate_domain_validation_options
  certificate_name                      = module.gradestats_web_certificate.certificate_name

  container_port = 3000
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}
