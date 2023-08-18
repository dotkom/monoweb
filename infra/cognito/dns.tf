data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

resource "aws_acm_certificate" "domain_certificate" {
  domain_name       = "auth.${terraform.workspace}.online.ntnu.no"
  validation_method = "DNS"

  provider = aws.us-east-1
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.domain_certificate.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = data.aws_route53_zone.online.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate_validation" "certificate_validation" {
  certificate_arn         = aws_acm_certificate.domain_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
  provider                = aws.us-east-1
}

resource "aws_route53_record" "auth_domain" {
  name    = aws_acm_certificate.domain_certificate.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.online.zone_id
  alias {
    evaluate_target_health = false
    name                   = aws_cognito_user_pool_domain.domain.cloudfront_distribution_arn
    // Fixed value, see docs
    // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-route53-aliastarget.html
    zone_id = "Z2FDTNDATAQYW2"
  }
}
