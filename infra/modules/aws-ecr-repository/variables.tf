variable "ecr_repository_name" {
  description = "Name for the ECR repository"
  type        = string
}

variable "ecr_lifecycle_policy" {
  description = "ECR Lifecycle policy for deleting old images from the ECR repository"
  type        = object({})
  default = {
    rules = [
      {
        rulePriority = 1
        description  = "Delete untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  }
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
