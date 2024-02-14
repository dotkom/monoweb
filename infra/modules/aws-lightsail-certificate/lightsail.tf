resource "aws_lightsail_certificate" "this" {
  name                      = var.certificate_name
  domain_name               = var.public_domain_name
  subject_alternative_names = var.san

  tags = var.tags
}
