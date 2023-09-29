resource "aws_acm_certificate" "certificate" {
  domain_name       = "${terraform.workspace}.static.online.ntnu.no"
  validation_method = "DNS"

  provider = aws.us-east-1
}

resource "aws_acm_certificate_validation" "certificate_validation" {
  certificate_arn         = aws_acm_certificate.certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
  provider                = aws.us-east-1
}
