resource "aws_route53_record" "alias" {
  name    = var.public_domain_name
  type    = "A"
  zone_id = var.dns_zone_id

  alias {
    # Apparently there is nothing in the state file that prevents us from doing Regex here
    name = regex("https:\\/\\/(?P<domain>.+)\\/", aws_lightsail_container_service.this.url).domain
    # See fixed values at https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-route-53-alias-record-for-container-service
    zone_id                = "Z016970523TDG2TZMUXKK"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "certificate" {
  for_each = {
    for record in aws_lightsail_certificate.this.domain_validation_options : record.domain_name => {
      resource_record_name  = record.resource_record_name
      resource_record_type  = record.resource_record_type
      resource_record_value = record.resource_record_value
    }
  }

  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  zone_id = var.dns_zone_id
  ttl     = 60
}
