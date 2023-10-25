resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = aws_iam_role.lambda_execution_role.arn
  timeout       = var.function_timeout
  image_uri     = "${aws_ecr_repository.this.repository_url}:latest"
  package_type  = "Image"

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}
