resource "aws_s3_bucket" "static_bucket" {
  bucket = "monoweb-static-${terraform.workspace}"
}

resource "aws_s3_bucket_cors_configuration" "static_bucket" {
  bucket = aws_s3_bucket.static_bucket.id

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET", "POST", "HEAD"]
    allowed_origins = ["${terraform.workspace}.static.online.ntnu.no"]
    max_age_seconds = 3600
  }
}

#resource "aws_s3_bucket_policy" "static_bucket" {
#  bucket = aws_s3_bucket.static_bucket.id
##  policy = data.aws_iam_policy_document.cloudfront_read_access.json
#}

resource "aws_s3_bucket_website_configuration" "static_bucket" {
  bucket = aws_s3_bucket.static_bucket.id

  error_document {
    key = "error.html"
  }

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "static_bucket" {
  bucket = aws_s3_bucket.static_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = false
}
