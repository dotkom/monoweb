data "aws_iam_policy_document" "cdn" {
  version = "2008-10-17"
  statement {
    sid    = "AllowPublicRead"
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.this.arn}/*"
    ]
  }
}
