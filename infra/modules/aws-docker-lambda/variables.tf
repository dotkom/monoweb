variable "function_name" {
  description = "AWS Lambda function name"
  type        = string
}

variable "function_timeout" {
  description = "Timeout limit for Lambda function"
  type        = number
  default     = 60
}

variable "environment_variables" {
  description = "Environment variables to attach to the lambda"
  type        = map(string)
  default     = {}
}

variable "execution_role_name" {
  description = "Name for the IAM Role created for execution the Lambda function"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name for the ECR repository the function image is pulled from"
  type        = string
}

variable "iam_inline_policies" {
  description = "Additional inline policies to attach to the IAM role"
  type        = list(object({ name = string, policy = string }))
  default     = []
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
