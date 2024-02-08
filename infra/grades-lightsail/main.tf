locals {
  app_public_domain_name = terraform.workspace == "dev" ? "dev.grades.no" : "grades.no"
}

module "gradestats_app" {
  source = "../modules/aws-lightsail-container-service"

  dns_zone_id           = data.aws_route53_zone.grades.zone_id
  public_domain_name    = local.app_public_domain_name
  service_name          = "gradestats-${terraform.workspace}"
  environment_variables = data.doppler_secrets.grades.map
  image_tag             = "0.1.1"

  container_port = 8081
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}
