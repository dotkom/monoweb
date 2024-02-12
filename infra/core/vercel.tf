locals {
  # TODO: Replace with online.ntnu.no once monoweb is shipped
  web_domain_name       = "web.online.ntnu.no"
  dashboard_domain_name = "dashboard.online.ntnu.no"
}

module "web_vercel_project" {
  source = "../modules/vercel-application"

  project_name   = "web"
  domain_name    = local.web_domain_name
  zone_id        = data.aws_route53_zone.online.zone_id
  build_command  = "cd ../.. && pnpm build:web"
  root_directory = "apps/web"
}

module "dashboard_vercel_project" {
  source = "../modules/vercel-application"

  project_name   = "dashboard"
  domain_name    = local.dashboard_domain_name
  zone_id        = data.aws_route53_zone.online.zone_id
  build_command  = "cd ../.. && pnpm build:dashboard"
  root_directory = "apps/dashboard"
}
