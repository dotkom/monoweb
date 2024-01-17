data "aws_route53_zone" "grades" {
  name = "grades.no"
}

resource "aws_route53_record" "grades_no" {
  zone_id = data.aws_route53_zone.grades.zone_id

  name = "grades.no"
  type = "A"

  alias {
    name                   = module.core_alb.dns_name
    zone_id                = module.core_alb.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_grades_no" {
  zone_id = data.aws_route53_zone.grades.zone_id

  name = "www.grades.no"
  type = "CNAME"
  ttl  = 3600

  records = [module.core_alb.dns_name]
}
