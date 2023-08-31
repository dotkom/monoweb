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
