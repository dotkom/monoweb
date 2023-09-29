import {
  to = vercel_project.monoweb
  id = "prj_ojfJBhSht8MDWDP1gxeTRAa6vV75"
}

resource "vercel_project" "monoweb" {
  name      = "monoweb"
  framework = "nextjs"

  git_repository = {
    production_branch = "main"
    type              = "github"
    repo              = "dotkom/monoweb"
  }

  build_command  = "cd ../.. &&  pnpm build:web"
  root_directory = "apps/web"

  lifecycle {
    prevent_destroy = true
  }
}

resource "vercel_project_domain" "domain" {
  domain     = aws_route53_record.domain.name
  project_id = vercel_project.monoweb.id
}

resource "vercel_project" "dashboard" {
  name      = "dashboard"
  framework = "nextjs"

  git_repository = {
    production_branch = "main"
    type              = "github"
    repo              = "dotkom/monoweb"
  }

  build_command  = "cd ../.. && pnpm build:dashboard"
  root_directory = "apps/dashboard"

  lifecycle {
    prevent_destroy = true
  }
}

resource "vercel_project_domain" "dashboard_domain" {
  domain     = aws_route53_record.dashboard_domain.name
  project_id = vercel_project.dashboard.id
}
