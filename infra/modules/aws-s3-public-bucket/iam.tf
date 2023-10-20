data "aws_iam_policy_document" "cdn" {
  version = "2008-10-17"
  statement {
    sid    = "AllowCloudFrontReadOnly"
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        aws_cloudfront_origin_access_identity.this.iam_arn
      ]
    }
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.this.arn}/*"
    ]
  }
}
