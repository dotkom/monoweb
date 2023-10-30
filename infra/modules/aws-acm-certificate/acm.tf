resource "aws_acm_certificate_validation" "certificate_validation" {
  certificate_arn         = aws_acm_certificate.certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
  provider                = aws.us-east-1
}

resource "aws_acm_certificate" "certificate" {
  domain_name       = var.domain
  validation_method = "DNS"

  provider = aws.us-east-1
  tags     = var.tags
}
