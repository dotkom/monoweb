output "lambda_function" {
  value = aws_lambda_function.this.id
}

output "ecr_repository" {
  value = aws_ecr_repository.this.id
}

output "iam_role" {
  value = aws_iam_role.lambda_execution_role.id
}
