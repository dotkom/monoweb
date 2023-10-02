resource "aws_ecr_repository" "this" {
  name                 = var.ecr_repository_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = var.tags
}

resource "aws_ecr_lifecycle_policy" "this" {
  count = var.ecr_lifecycle_policy == {} ? 0 : 1
  policy     = jsonencode(var.ecr_lifecycle_policy)
  repository = aws_ecr_repository.this.id
}
