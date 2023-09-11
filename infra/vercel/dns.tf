data "aws_route53_zone" "online" {
  name = "online.ntnu.no"
}

resource "aws_route53_record" "domain" {
  name    = "${terraform.workspace}.monoweb.online.ntnu.no"
  zone_id = data.aws_route53_zone.online.zone_id
  type    = "CNAME"
  ttl     = "300"
  records = ["cname.vercel-dns.com"]
}