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

resource "aws_iam_role" "trigger_execution_role" {
  name               = "LambdaExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_execute_assume.json
}

resource "aws_lambda_permission" "cognito" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_trigger_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
}

resource "aws_lambda_function" "cognito_trigger_signup" {
  function_name    = "cognito-trigger-signup-${terraform.workspace}"
  role             = aws_iam_role.trigger_execution_role.arn
  handler          = "lambda.handler"
  runtime          = "nodejs18.x"
  timeout          = 10
  s3_bucket         = aws_s3_object.lambda_trigger_signup.bucket
  s3_key            = aws_s3_object.lambda_trigger_signup.key
}
