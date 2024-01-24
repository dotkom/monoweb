resource "aws_ecrpublic_repository" "pgx_ulid" {
  repository_name = "dotkom/pgx-ulid"

  catalog_data {
    about_text        = "PostGreSQL 15 image with [pgx_ulid](https://github.com/pksunkara/pgx_ulid) extension installed"
    architectures     = ["x86-64"]
    description       = "This is a fork of the PostGreSQL 15 base image with the pgx_ulid extension installed."
    operating_systems = ["Linux"]
    usage_text        = "Pull like any other PostGreSQL official image. Install with `CREATE EXTENSION IF NOT EXISTS ulid;`"
  }

  provider = aws.us-east-1
}

# Required because AWS Cognito requires an A record at the parent domain
resource "aws_route53_record" "null_record" {
  name    = "auth.online.ntnu.no"
  type    = "A"
  zone_id = data.aws_route53_zone.online.zone_id
  ttl     = 3600
  records = ["127.0.0.1"]
}
