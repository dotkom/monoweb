module "gradestats_app_repository" {
  source = "../aws-ecr-repository"

  ecr_repository_name = var.service_name
  tags                = var.tags
}

resource "aws_ecr_repository_policy" "pull" {
  policy     = data.aws_iam_policy_document.pull.json
  repository = module.gradestats_app_repository.ecr_repository_name
}
