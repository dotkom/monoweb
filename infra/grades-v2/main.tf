locals {
  project_name = "grades-v2-${terraform.workspace}"
}

module "postgres" {
  source = "../modules/neon-project"

  project_name = local.project_name
  role_name    = "grades-v2"
}
