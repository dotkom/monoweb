resource "aws_cloudfront_origin_access_identity" "cloudfront_access" {
  comment = "cloudfront access"
}

data "aws_iam_policy_document" "cloudfront_read_access" {
  version = "2008-10-17"
  statement {
    sid    = "AllowCloudFrontReadOnly"
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        aws_cloudfront_origin_access_identity.cloudfront_access.iam_arn
      ]
    }
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.static_bucket.arn}/*"
    ]
  }
}

resource "aws_cloudfront_distribution" "static_bucket" {
  origin {
    domain_name = "${terraform.workspace}.static.online.ntnu.no.s3.amazonaws.com"
    origin_id   = "${terraform.workspace}.static.online.ntnu.no"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cloudfront_access.cloudfront_access_identity_path
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_root_object = "index.html"
  aliases             = ["${terraform.workspace}.static.online.ntnu.no"]

  price_class = "PriceClass_100"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${terraform.workspace}.static.online.ntnu.no"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 86400
    default_ttl            = 86400
    max_ttl                = 86400 * 7
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.certificate_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}