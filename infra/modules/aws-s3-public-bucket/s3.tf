## ---------------------------------------------------------------------------------------------------------------------
## Amazon S3 Bucket configuration with website and CORS configuration
## ---------------------------------------------------------------------------------------------------------------------

resource "aws_s3_bucket" "this" {
  bucket = var.domain_name

  tags = var.tags
}

resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET", "POST", "HEAD"]
    allowed_origins = ["https://${var.domain_name}"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  error_document {
    key = "_error.html"
  }

  index_document {
    suffix = "_index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "cloudfront" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.cdn.json
}
