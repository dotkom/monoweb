data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

locals {
  zone_id             = data.aws_route53_zone.online.zone_id
}
