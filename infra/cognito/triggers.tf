data "aws_iam_policy_document" "lambda_execute_assume" {
  statement {
    sid = "LambdaExecutionAssume"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_execute_ses" {
  statement {
    sid = "LambdaExecuteSES"
    effect = "Allow"
    actions = ["ses:SendEmail"]
    resources = ["arn:aws:ses:eu-north-1:891459268445:identity/online.ntnu.no"]
  }
}

resource "aws_iam_role" "trigger_execution_role" {
  name               = "LambdaExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_execute_assume.json

  inline_policy {
    name = "lambda-execute-ses"
    policy = data.aws_iam_policy_document.lambda_execute_ses.json
  }
}

resource "aws_iam_role_policy_attachment" "aws_lambda_execution_role" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.trigger_execution_role.name
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
