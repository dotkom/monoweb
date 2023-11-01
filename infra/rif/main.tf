locals {
  rif_domain_name = "${terraform.workspace}.interesse.online.ntnu.no"
  zone_id         = data.aws_route53_zone.online.zone_id
}

module "rif_vercel_project" {
  source = "../modules/vercel-application"

  project_name   = "rif"
  domain_name    = local.rif_domain_name
  zone_id        = local.zone_id
  build_command  = "cd ../.. && pnpm build:rif"
  root_directory = "apps/rif"
}