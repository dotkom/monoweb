output "lambda_function_id" {
  value = aws_lambda_function.this.id
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "ecr_repository" {
  value = aws_ecr_repository.this.id
}

output "iam_role" {
  value = aws_iam_role.lambda_execution_role.id
}
