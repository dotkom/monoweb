locals {
  vengeful_project_name = "vengeful-vineyard-${terraform.workspace}"
}

module "vengeful_database" {
  source       = "./modules/neon-project"
  project_name = local.vengeful_project_name
  role_name    = "vengeful"
}
