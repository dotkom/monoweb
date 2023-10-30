resource "aws_acm_certificate_validation" "certificate_validation" {
  certificate_arn         = aws_acm_certificate.certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
  provider                = aws.regional
}

resource "aws_acm_certificate" "certificate" {
  domain_name       = var.domain
  validation_method = "DNS"

  provider = aws.regional
  tags     = var.tags
}
