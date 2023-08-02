resource "neon_project" "monoweb" {
  name       = "monoweb"
  region_id  = "aws-eu-central-1"
  pg_version = 15

  branch = {
    endpoint = {
      max_cu = 0.25
      min_cu = 0.25
    }
  }
}

resource "neon_role" "monoweb" {
  name       = "monoweb-${terraform.workspace}"
  branch_id  = neon_project.monoweb.branch.id
  project_id = neon_project.monoweb.id
}

resource "neon_database" "example" {
  name       = "monoweb-${terraform.workspace}"
  owner_name = neon_role.monoweb.name
  branch_id  = neon_project.monoweb.branch.id
  project_id = neon_project.monoweb.id

  lifecycle {
    prevent_destroy = true
  }
}
