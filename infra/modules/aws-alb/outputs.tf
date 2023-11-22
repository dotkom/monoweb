output "alb_arn" {
  value = aws_lb.this.arn
}

output "zone_id" {
  value = aws_lb.this.zone_id
}

output "dns_name" {
  value = aws_lb.this.dns_name
}
