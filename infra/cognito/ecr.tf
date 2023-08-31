locals {
  lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description = "Delete untagged images after 7 days"
        selection = {
          tagStatus = "untagged"
          countType = "sinceImagePushed"
          countUnit = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository" "cognito_trigger_signup" {
  name = "cognito-trigger-signup-${terraform.workspace}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_lifecycle_policy" "cognito_trigger_signup" {
  repository = aws_ecr_repository.cognito_trigger_signup.id
  policy     = local.lifecycle_policy
}
