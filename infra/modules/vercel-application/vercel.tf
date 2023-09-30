resource "vercel_project" "this" {
  name      = var.project_name
  framework = var.preset

  git_repository = {
    production_branch = "main"
    type              = "github"
    repo              = "dotkom/monoweb"
  }

  build_command  = var.build_command
  root_directory = var.root_directory
}

resource "vercel_project_domain" "domain" {
  domain     = aws_route53_record.domain.name
  project_id = vercel_project.this.id
}
