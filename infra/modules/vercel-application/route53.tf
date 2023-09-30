resource "aws_route53_record" "domain" {
  name    = var.domain_name
  zone_id = var.zone_id
  type    = "CNAME"
  ttl     = "300"
  records = ["cname.vercel-dns.com"]
}
