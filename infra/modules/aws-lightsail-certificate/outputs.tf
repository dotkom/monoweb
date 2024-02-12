output "certificate_name" {
  value = aws_lightsail_certificate.this.name
}

output "certificate_arn" {
  value = aws_lightsail_certificate.this.arn
}

output "certificate_domain_validation_options" {
  value = aws_lightsail_certificate.this.domain_validation_options
}
