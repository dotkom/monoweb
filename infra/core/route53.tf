resource "aws_route53_zone" "grades" {
  name = "grades.no"
}

data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

