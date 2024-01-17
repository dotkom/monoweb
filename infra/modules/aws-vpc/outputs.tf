output "public_subnets" {
  value = aws_subnet.public[*].id
}

output "private_subnets" {
  value = aws_subnet.private[*].id
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "default_security_group" {
  value = aws_security_group.default_security_group.id
}
