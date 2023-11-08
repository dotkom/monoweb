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
