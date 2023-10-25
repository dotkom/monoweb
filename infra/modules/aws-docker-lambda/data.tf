data "aws_iam_policy_document" "lambda_execute_assume" {
  statement {
    sid    = "LambdaExecutionAssume"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}
