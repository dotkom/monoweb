resource "aws_iam_role" "lambda_execution_role" {
  name               = var.execution_role_name
  assume_role_policy = data.aws_iam_policy_document.lambda_execute_assume.json

  dynamic "inline_policy" {
    for_each = var.iam_inline_policies
    content {
      name   = inline_policy.value.name
      policy = inline_policy.value.policy
    }
  }

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "aws_lambda_execution_role" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}
