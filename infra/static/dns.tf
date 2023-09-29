data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.certificate.domain_validation_options : dvo.domain_name => {
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

resource "aws_route53_record" "static_online_ntnu_no" {
  zone_id = data.aws_route53_zone.online.zone_id
  name    = "m.jun.codes"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.static_bucket.domain_name
    zone_id                = aws_cloudfront_distribution.static_bucket.hosted_zone_id
    evaluate_target_health = false
  }
}