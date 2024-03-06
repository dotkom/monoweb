data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}
