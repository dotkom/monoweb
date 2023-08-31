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

resource "aws_lambda_permission" "cognito" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_trigger_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
}

resource "aws_lambda_function" "cognito_trigger_signup" {
  function_name    = "cognito-trigger-signup-${terraform.workspace}"
  role             = aws_iam_role.trigger_execution_role.arn
  timeout          = 10
  image_uri        = "${aws_ecr_repository.cognito_trigger_signup.repository_url}:latest"
  package_type     = "Image"
}