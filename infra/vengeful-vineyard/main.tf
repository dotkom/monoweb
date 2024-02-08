locals {
  vengeful_project_name       = "vengeful-vineyard-${terraform.workspace}"
  vengeful_domain_name        = "${terraform.workspace}.redwine.online.ntnu.no"
  vengeful_server_domain_name = "api.${terraform.workspace}.redwine.online.ntnu.no"
  vengeful_cdn_domain_name    = "${terraform.workspace}.redwine-static.online.ntnu.no"
  zone_id                     = data.aws_route53_zone.online.zone_id
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

  dns_zone_id           = data.aws_route53_zone.online.zone_id
  public_domain_name    = local.vengeful_server_domain_name
  service_name          = "vengeful-server-${terraform.workspace}"
  environment_variables = data.doppler_secrets.vengeful.map
  image_tag             = "0.2.1"

  certificate_domain_validation_options = module.vengeful_vineyard_server_certificate.certificate_domain_validation_options
  certificate_name                      = module.vengeful_vineyard_server_certificate.certificate_name

  healthcheck_timeout = 10

  container_port = 8000
  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}
