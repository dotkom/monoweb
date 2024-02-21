resource "neon_project" "this" {
  name       = var.project_name
  region_id  = "aws-eu-central-1"
  pg_version = "15"

  branch = {
    name = "main"
    endpoint = {
      max_cu          = 0.25
      min_cu          = 0.25
      suspend_timeout = 300
    }
  }
}

resource "neon_role" "this" {
  name       = var.role_name
  project_id = neon_project.this.id
  branch_id  = neon_project.this.branch.id
}

resource "neon_database" "main" {
  name       = "main"
  owner_name = neon_role.this.name
  branch_id  = neon_project.this.branch.id
  project_id = neon_project.this.id
}
