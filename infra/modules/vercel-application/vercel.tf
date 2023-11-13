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

  # Do not run on renovate pull requests
  ignore_command = "[ \"$VERCEL_GIT_COMMIT_AUTHOR_LOGIN\" == \"renovate[bot]\" ]"
}

resource "vercel_project_environment_variable" "environment_variables" {
  for_each = var.environment_variables

  project_id = vercel_project.this.id
  key        = each.key
  value      = sensitive(each.value)
  target     = ["preview", "development", "production"]
}

resource "vercel_project_domain" "domain" {
  domain     = aws_route53_record.domain.name
  project_id = vercel_project.this.id
}
