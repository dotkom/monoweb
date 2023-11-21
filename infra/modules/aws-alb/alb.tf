resource "aws_lb" "this" {
  name = var.load_balancer_name
  load_balancer_type = "application"
  security_groups = var.security_groups
  subnets = var.subnets

  tags = var.tags
}
