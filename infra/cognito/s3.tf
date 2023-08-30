resource "aws_s3_bucket" "lambda_trigger_store" {
  bucket = "cognito-trigger-${terraform.workspace}.online.ntnu.no"
}

resource "aws_s3_object" "lambda_trigger_signup" {
  bucket = aws_s3_bucket.lambda_trigger_store.id
  key    = "cognito-trigger-signup-lambda.zip"
}
